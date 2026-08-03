import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import {
  absoluteUrl,
  formatCurrency,
  generateOrderNumber,
  isValidPrice,
} from "@/lib/utils";
import { Cart } from "@/models/Cart";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { Customer } from "@/models/Customer";
import { Discount } from "@/models/Discount";
import { SiteSettings } from "@/models/SiteSettings";
import { rateLimit } from "@/lib/rate-limit";

const CART_COOKIE = "rw_cart_sid";

const addressSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  province: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().default("CA"),
});

const checkoutSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  billingAddress: addressSchema,
  shippingAddress: addressSchema,
  shippingMethod: z.object({
    id: z.string(),
    name: z.string(),
    price: z.number().min(0),
  }),
  discountCode: z.string().optional(),
  customerNotes: z.string().optional(),
  sameAsShipping: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Checkout is not available right now" },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Checkout is not available right now" },
      { status: 503 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const limited = rateLimit(`checkout:${ip}`, 10, 60_000);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const sessionId = request.cookies.get(CART_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const json: unknown = await request.json();
  const parsed = checkoutSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid checkout data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await connectDB();
  const cart = await Cart.findOne({ sessionId });
  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Re-validate each line against live product pricing
  const orderItems: Array<{
    productId: typeof cart.items[0]["productId"];
    variantId?: string;
    name: string;
    slug?: string;
    sku?: string;
    image?: string;
    price: number;
    quantity: number;
    variantLabel?: string;
    personalization?: typeof cart.items[0]["personalization"];
  }> = [];

  for (const line of cart.items) {
    const product = await Product.findById(line.productId);
    if (!product || product.status !== "published") {
      return NextResponse.json(
        { error: `Product unavailable: ${line.name}` },
        { status: 400 },
      );
    }
    if (product.priceVisibility === "contact") {
      return NextResponse.json(
        {
          error: `"${product.name}" requires a custom quote and cannot be checked out online.`,
        },
        { status: 400 },
      );
    }

    let unitPrice: number | null = null;
    if (line.variantId) {
      const variant = product.variants.find(
        (v) => String(v._id) === line.variantId,
      );
      unitPrice = isValidPrice(variant?.price) ? (variant!.price as number) : null;
    } else {
      unitPrice = isValidPrice(product.price) ? (product.price as number) : null;
    }

    if (unitPrice === null) {
      return NextResponse.json(
        {
          error: `"${product.name}" has no valid price and cannot be checked out.`,
        },
        { status: 400 },
      );
    }

    orderItems.push({
      productId: line.productId,
      variantId: line.variantId ?? undefined,
      name: product.name,
      slug: product.slug,
      sku: product.sku ?? undefined,
      image: product.images?.[0]?.url ?? line.image ?? undefined,
      price: unitPrice,
      quantity: line.quantity,
      variantLabel: line.variantLabel ?? undefined,
      personalization: line.personalization,
    });
  }

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  let discountAmount = 0;
  let discountCode: string | undefined;
  if (parsed.data.discountCode) {
    const code = parsed.data.discountCode.toUpperCase().trim();
    const discount = await Discount.findOne({ code, active: true });
    const now = new Date();
    if (
      discount &&
      (!discount.startsAt || discount.startsAt <= now) &&
      (!discount.endsAt || discount.endsAt >= now) &&
      (discount.maxUses == null || discount.usedCount < discount.maxUses) &&
      subtotal >= (discount.minSubtotal ?? 0)
    ) {
      discountAmount =
        discount.type === "percentage"
          ? Math.min(subtotal, (subtotal * discount.value) / 100)
          : Math.min(subtotal, discount.value);
      discountCode = discount.code;
    }
  }

  const settings = await SiteSettings.findOne({ singletonKey: "site" });
  const shippingAmount = parsed.data.shippingMethod.price;
  const taxable = Math.max(0, subtotal - discountAmount + shippingAmount);
  const taxRate = settings?.tax?.enabled ? (settings.tax.rate ?? 0) : 0;
  const taxAmount = settings?.tax?.includedInPrice
    ? 0
    : Math.round(taxable * taxRate * 100) / 100;
  const total = Math.round((taxable + taxAmount) * 100) / 100;

  if (total <= 0) {
    return NextResponse.json(
      { error: "Order total must be greater than zero" },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase().trim();
  let customer = await Customer.findOne({ email });
  if (!customer) {
    customer = await Customer.create({
      email,
      name: parsed.data.shippingAddress.fullName,
      phone: parsed.data.phone,
    });
  }

  const orderNumber = generateOrderNumber();
  const order = await Order.create({
    orderNumber,
    customerId: customer._id,
    email,
    phone: parsed.data.phone,
    items: orderItems,
    subtotal,
    discountAmount,
    discountCode,
    shippingAmount,
    taxAmount,
    total,
    currency: settings?.currency ?? "CAD",
    paymentStatus: "pending",
    fulfillmentStatus: "pending_payment",
    billingAddress: parsed.data.billingAddress,
    shippingAddress: parsed.data.shippingAddress,
    shippingMethod: parsed.data.shippingMethod,
    customerNotes: parsed.data.customerNotes,
    timeline: [
      {
        status: "pending_payment",
        note: "Checkout started",
        visibleToCustomer: false,
        createdAt: new Date(),
        createdBy: "system",
      },
    ],
  });

  const lineItems = orderItems.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: (settings?.currency ?? "CAD").toLowerCase(),
      unit_amount: Math.round(item.price * 100),
      product_data: {
        name: item.variantLabel
          ? `${item.name} (${item.variantLabel})`
          : item.name,
        images: item.image ? [absoluteUrl(item.image)] : undefined,
      },
    },
  }));

  if (shippingAmount > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: (settings?.currency ?? "CAD").toLowerCase(),
        unit_amount: Math.round(shippingAmount * 100),
        product_data: {
          name: parsed.data.shippingMethod.name || "Shipping",
          images: undefined,
        },
      },
    });
  }

  if (taxAmount > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: (settings?.currency ?? "CAD").toLowerCase(),
        unit_amount: Math.round(taxAmount * 100),
        product_data: {
          name: settings?.tax?.label || "Tax",
          images: undefined,
        },
      },
    });
  }

  let stripeCouponId: string | undefined;
  if (discountAmount > 0) {
    const coupon = await stripe.coupons.create({
      amount_off: Math.round(discountAmount * 100),
      currency: (settings?.currency ?? "CAD").toLowerCase(),
      duration: "once",
      name: discountCode ? `Discount ${discountCode}` : "Order discount",
    });
    stripeCouponId = coupon.id;
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: lineItems,
    discounts: stripeCouponId ? [{ coupon: stripeCouponId }] : undefined,
    success_url: absoluteUrl(
      `/order-confirmation?order=${encodeURIComponent(orderNumber)}&session_id={CHECKOUT_SESSION_ID}`,
    ),
    cancel_url: absoluteUrl("/checkout?cancelled=1"),
    metadata: {
      orderId: String(order._id),
      orderNumber,
    },
    payment_intent_data: {
      metadata: {
        orderId: String(order._id),
        orderNumber,
      },
    },
  });

  order.stripeSessionId = checkoutSession.id;
  await order.save();

  return NextResponse.json({
    url: checkoutSession.url,
    sessionId: checkoutSession.id,
    orderNumber,
    total: formatCurrency(total, settings?.currency ?? "CAD"),
  });
}
