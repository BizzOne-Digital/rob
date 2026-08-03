import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { connectDB } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { sendOrderConfirmation } from "@/lib/email";
import { formatCurrency } from "@/lib/utils";
import { Order } from "@/models/Order";
import { Customer } from "@/models/Customer";
import { Discount } from "@/models/Discount";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 },
    );
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("[stripe:webhook]", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  await connectDB();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    const orderNumber = session.metadata?.orderNumber;

    const order = orderId
      ? await Order.findById(orderId)
      : orderNumber
        ? await Order.findOne({ orderNumber })
        : session.id
          ? await Order.findOne({ stripeSessionId: session.id })
          : null;

    if (!order) {
      console.error("[stripe:webhook] Order not found for session", session.id);
      return NextResponse.json({ received: true, warning: "order_not_found" });
    }

    // Idempotency: skip if this event was already processed
    if (order.stripeEventIds?.includes(event.id)) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
      order.fulfillmentStatus = "paid";
      order.paidAt = new Date();
      order.stripePaymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;
      order.stripeSessionId = session.id;
      order.timeline.push({
        status: "paid",
        note: "Payment confirmed via Stripe",
        visibleToCustomer: true,
        createdAt: new Date(),
        createdBy: "stripe",
      });
    }

    order.stripeEventIds = [...(order.stripeEventIds ?? []), event.id];
    await order.save();

    if (order.discountCode) {
      await Discount.updateOne(
        { code: order.discountCode },
        { $inc: { usedCount: 1 } },
      );
    }

    if (order.customerId) {
      await Customer.updateOne(
        { _id: order.customerId },
        {
          $inc: { orderCount: 1, totalSpent: order.total },
          $set: { name: order.shippingAddress?.fullName, phone: order.phone },
        },
      );
    }

    await sendOrderConfirmation({
      email: order.email,
      orderNumber: order.orderNumber,
      total: formatCurrency(order.total, order.currency ?? "CAD"),
    });
  }

  return NextResponse.json({ received: true });
}
