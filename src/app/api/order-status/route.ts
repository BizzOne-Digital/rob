import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { Order } from "@/models/Order";

const querySchema = z.object({
  orderNumber: z.string().min(1),
  email: z.string().email(),
});

export async function GET(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const limited = rateLimit(`order-status:${ip}`, 20, 60_000);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = querySchema.safeParse({
    orderNumber: request.nextUrl.searchParams.get("orderNumber") ?? "",
    email: request.nextUrl.searchParams.get("email") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "orderNumber and email are required" },
      { status: 400 },
    );
  }

  await connectDB();
  const order = await Order.findOne({
    orderNumber: parsed.data.orderNumber.trim(),
    email: parsed.data.email.toLowerCase().trim(),
  }).lean();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const visibleTimeline = (order.timeline ?? []).filter(
    (event) => event.visibleToCustomer,
  );

  return NextResponse.json({
    order: {
      orderNumber: order.orderNumber,
      email: order.email,
      fulfillmentStatus: order.fulfillmentStatus,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber,
      customerVisibleNotes: order.customerVisibleNotes,
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        variantLabel: item.variantLabel,
        image: item.image,
      })),
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      shippingAmount: order.shippingAmount,
      taxAmount: order.taxAmount,
      total: order.total,
      currency: order.currency,
      shippingMethod: order.shippingMethod,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      timeline: visibleTimeline,
    },
  });
}
