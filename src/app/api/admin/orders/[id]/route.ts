import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import {
  sendOrderConfirmation,
  sendShippingEmail,
  toOrderEmailData,
} from "@/lib/email";
import { Order } from "@/models/Order";

type RouteContext = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  fulfillmentStatus: z
    .enum([
      "pending_payment",
      "paid",
      "confirmed",
      "in_production",
      "ready_for_pickup",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ])
    .optional(),
  paymentStatus: z
    .enum(["pending", "paid", "failed", "refunded", "partially_refunded"])
    .optional(),
  trackingNumber: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  customerVisibleNotes: z.string().optional().nullable(),
  timelineNote: z.string().optional(),
  timelineVisibleToCustomer: z.boolean().optional(),
  sendConfirmation: z.boolean().optional(),
  sendShipping: z.boolean().optional(),
});

export async function GET(_request: NextRequest, context: RouteContext) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await connectDB();
  const item = await Order.findById(id).lean();
  if (!item) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({ item });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const json: unknown = await request.json();
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid order data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await connectDB();
  const order = await Order.findById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const data = parsed.data;
  const previousStatus = order.fulfillmentStatus;

  if (data.fulfillmentStatus !== undefined) {
    order.fulfillmentStatus = data.fulfillmentStatus;
  }
  if (data.paymentStatus !== undefined) {
    order.paymentStatus = data.paymentStatus;
  }
  if (data.trackingNumber !== undefined) {
    order.trackingNumber = data.trackingNumber ?? undefined;
  }
  if (data.internalNotes !== undefined) {
    order.internalNotes = data.internalNotes ?? undefined;
  }
  if (data.customerVisibleNotes !== undefined) {
    order.customerVisibleNotes = data.customerVisibleNotes ?? undefined;
  }

  const timelineStatus = data.fulfillmentStatus ?? order.fulfillmentStatus;
  if (
    data.fulfillmentStatus !== undefined ||
    data.timelineNote !== undefined ||
    data.trackingNumber !== undefined
  ) {
    order.timeline.push({
      status: timelineStatus,
      note:
        data.timelineNote ??
        (data.fulfillmentStatus
          ? `Status changed to ${data.fulfillmentStatus}`
          : data.trackingNumber
            ? `Tracking updated: ${data.trackingNumber}`
            : "Order updated"),
      visibleToCustomer: data.timelineVisibleToCustomer ?? false,
      createdAt: new Date(),
      createdBy: session?.user?.email ?? "admin",
    });
  }

  await order.save();

  if (
    ((data.fulfillmentStatus === "shipped" && previousStatus !== "shipped") ||
      data.sendShipping) &&
    order.email
  ) {
    await sendShippingEmail({
      email: order.email,
      orderNumber: order.orderNumber,
      trackingNumber: order.trackingNumber ?? undefined,
    });
  }

  if (data.sendConfirmation && order.email) {
    await sendOrderConfirmation(
      toOrderEmailData({
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
        paidAt: order.paidAt,
      }),
    );
  }

  await logActivity({
    session,
    action: "order.update",
    entityType: "Order",
    entityId: String(order._id),
    summary: `Updated order ${order.orderNumber}`,
    meta: {
      fulfillmentStatus: order.fulfillmentStatus,
      paymentStatus: order.paymentStatus,
      sendConfirmation: data.sendConfirmation ?? false,
      sendShipping: data.sendShipping ?? false,
    },
  });

  return NextResponse.json({ item: order });
}
