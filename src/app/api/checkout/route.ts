import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { getSquareClient, getSquareLocationId, isSquareConfigured } from "@/lib/square";
import {
  notifyAdminNewOrder,
  sendOrderConfirmation,
  toOrderEmailData,
} from "@/lib/email";
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
import { calculateCanadaShippingAmount } from "@/lib/shipping";
import { randomUUID } from "crypto";

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

  const orderItems: Array<{
    productId: (typeof cart.items)[0]["productId"];
    variantId?: string;
    name: string;
    slug?: string;
    sku?: string;
    image?: string;
    price: number;
    quantity: number;
    variantLabel?: string;
    personalization?: (typeof cart.items)[0]["personalization"];
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
      unitPrice = isValidPrice(variant?.price)
        ? (variant!.price as number)
        : null;
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
    } else if (parsed.data.discountCode.trim()) {
      return NextResponse.json(
        { error: "Discount code is invalid or expired" },
        { status: 400 },
      );
    }
  }

  const settings = await SiteSettings.findOne({ singletonKey: "site" });

  const shipCountry = parsed.data.shippingAddress.country?.toUpperCase() ?? "CA";
  if (shipCountry !== "CA") {
    return NextResponse.json(
      { error: "We currently deliver within Canada only." },
      { status: 400 },
    );
  }

  const methodId = parsed.data.shippingMethod.id;
  if (methodId !== "pickup" && methodId !== "shipping") {
    return NextResponse.json({ error: "Invalid shipping method" }, { status: 400 });
  }

  const expectedShipping = calculateCanadaShippingAmount(
    subtotal,
    methodId as "pickup" | "shipping",
  );
  if (Math.abs(parsed.data.shippingMethod.price - expectedShipping) > 0.01) {
    return NextResponse.json(
      { error: "Shipping rate has changed — please refresh checkout." },
      { status: 400 },
    );
  }

  const shippingAmount = expectedShipping;
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
  } else {
    customer.name = parsed.data.shippingAddress.fullName || customer.name;
    if (parsed.data.phone) customer.phone = parsed.data.phone;
    await customer.save();
  }

  const useSquare = isSquareConfigured();
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
    fulfillmentStatus: useSquare ? "pending_payment" : "confirmed",
    billingAddress: parsed.data.billingAddress,
    shippingAddress: parsed.data.shippingAddress,
    shippingMethod: parsed.data.shippingMethod,
    customerNotes: parsed.data.customerNotes,
    timeline: [
      {
        status: useSquare ? "pending_payment" : "confirmed",
        note: useSquare
          ? "Checkout started — awaiting Square payment"
          : "Order placed — awaiting payment confirmation",
        visibleToCustomer: true,
        createdAt: new Date(),
        createdBy: "system",
      },
    ],
  });

  const emailPayload = toOrderEmailData({
    orderNumber: order.orderNumber,
    email: order.email,
    phone: order.phone,
    currency: order.currency,
    subtotal: order.subtotal,
    discountAmount: order.discountAmount,
    discountCode: order.discountCode,
    shippingAmount: order.shippingAmount,
    taxAmount: order.taxAmount,
    total: order.total,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    shippingMethod: order.shippingMethod,
    shippingAddress: order.shippingAddress,
    billingAddress: order.billingAddress,
    customerNotes: order.customerNotes,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      variantLabel: item.variantLabel,
      sku: item.sku,
      personalization: item.personalization,
    })),
  });

  // Square path
  if (useSquare) {
    const square = getSquareClient();
    const locationId = getSquareLocationId();
    
    if (!square || !locationId) {
      return NextResponse.json(
        { error: "Checkout is not available right now" },
        { status: 503 },
      );
    }

    try {
      const lineItems = orderItems.map((item) => ({
        name: item.variantLabel ? `${item.name} (${item.variantLabel})` : item.name,
        quantity: String(item.quantity),
        basePriceMoney: {
          amount: BigInt(Math.round(item.price * 100)),
          currency: (settings?.currency ?? "CAD") as any,
        },
      }));

      // Add shipping as line item if applicable
      if (shippingAmount > 0) {
        lineItems.push({
          name: parsed.data.shippingMethod.name || "Shipping",
          quantity: "1",
          basePriceMoney: {
            amount: BigInt(Math.round(shippingAmount * 100)),
            currency: (settings?.currency ?? "CAD") as any,
          },
        });
      }

      // Add tax as line item if applicable
      if (taxAmount > 0) {
        lineItems.push({
          name: settings?.tax?.label || "Tax",
          quantity: "1",
          basePriceMoney: {
            amount: BigInt(Math.round(taxAmount * 100)),
            currency: (settings?.currency ?? "CAD") as any,
          },
        });
      }

      // Create Square checkout payment link
      // Format phone number for Square (E.164 format: +1234567890)
      let formattedPhone = parsed.data.phone;
      if (formattedPhone) {
        // Remove all non-digit characters
        formattedPhone = formattedPhone.replace(/\D/g, '');
        // Add +1 prefix for North America if not present and has 10 digits
        if (formattedPhone.length === 10) {
          formattedPhone = `+1${formattedPhone}`;
        } else if (formattedPhone.length === 11 && formattedPhone.startsWith('1')) {
          formattedPhone = `+${formattedPhone}`;
        } else if (!formattedPhone.startsWith('+')) {
          formattedPhone = `+${formattedPhone}`;
        }
      }

      const checkoutResponse = await square.checkout.paymentLinks.create({
        idempotencyKey: randomUUID(),
        order: {
          locationId,
          lineItems,
          discounts: discountAmount > 0 ? [{
            name: discountCode ? `Discount ${discountCode}` : "Order discount",
            amountMoney: {
              amount: BigInt(Math.round(discountAmount * 100)),
              currency: (settings?.currency ?? "CAD") as any,
            },
          }] : undefined,
        },
        checkoutOptions: {
          redirectUrl: absoluteUrl(
            `/order-success?order=${encodeURIComponent(orderNumber)}`,
          ),
          askForShippingAddress: false,
        },
        prePopulatedData: {
          buyerEmail: email,
          buyerPhoneNumber: formattedPhone || undefined,
          buyerAddress: {
            addressLine1: parsed.data.billingAddress.line1,
            addressLine2: parsed.data.billingAddress.line2,
            locality: parsed.data.billingAddress.city,
            administrativeDistrictLevel1: parsed.data.billingAddress.province,
            postalCode: parsed.data.billingAddress.postalCode,
            country: "CA",
          },
        },
      });

      // Square SDK returns paymentLink directly in response (not wrapped in result)
      const paymentLink = checkoutResponse.paymentLink;
      
      if (!paymentLink?.url) {
        console.error('Square checkout response:', JSON.stringify(checkoutResponse, null, 2));
        throw new Error("Square checkout URL not generated");
      }

      order.squarePaymentLinkId = paymentLink.id;
      order.squareOrderId = paymentLink.orderId;
      await order.save();

      return NextResponse.json({
        mode: "square",
        url: paymentLink.url,
        paymentLinkId: paymentLink.id,
        orderNumber,
        total: formatCurrency(total, settings?.currency ?? "CAD"),
      });
    } catch (error: any) {
      console.error("Square checkout error:", error);
      return NextResponse.json(
        { error: "Failed to create payment link", details: error.message },
        { status: 500 },
      );
    }
  }

  // Manual / local checkout (no Stripe) — order is saved for admin + emails sent
  if (discountCode) {
    await Discount.updateOne({ code: discountCode }, { $inc: { usedCount: 1 } });
  }

  await Customer.updateOne(
    { _id: customer._id },
    {
      $inc: { orderCount: 1, totalSpent: total },
      $set: {
        name: parsed.data.shippingAddress.fullName,
        phone: parsed.data.phone,
      },
    },
  );

  cart.items.splice(0, cart.items.length);
  await cart.save();

  await Promise.all([
    sendOrderConfirmation(emailPayload),
    notifyAdminNewOrder(emailPayload),
  ]);

  return NextResponse.json({
    mode: "manual",
    orderNumber,
    total: formatCurrency(total, settings?.currency ?? "CAD"),
    redirectUrl: `/order-success?order=${encodeURIComponent(orderNumber)}`,
  });
}
