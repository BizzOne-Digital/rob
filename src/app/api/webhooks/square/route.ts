import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Customer } from "@/models/Customer";
import { Discount } from "@/models/Discount";
import { Cart } from "@/models/Cart";
import { sendOrderConfirmation, notifyAdminNewOrder, toOrderEmailData } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-square-hmacsha256-signature");
    
    // Optional: Verify webhook signature
    const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
    if (webhookSignatureKey && signature) {
      const crypto = await import("crypto");
      const hmac = crypto.createHmac("sha256", webhookSignatureKey);
      hmac.update(body);
      const expectedSignature = hmac.digest("base64");
      
      if (signature !== expectedSignature) {
        console.error("Invalid Square webhook signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(body);
    
    await connectDB();

    // Handle payment.updated event
    if (event.type === "payment.updated") {
      const payment = event.data?.object?.payment;
      
      if (!payment) {
        return NextResponse.json({ error: "No payment data" }, { status: 400 });
      }

      const squareOrderId = payment.orderId;
      const order = await Order.findOne({ squareOrderId });

      if (!order) {
        console.error(`Order not found for Square order ID: ${squareOrderId}`);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Payment completed successfully
      if (payment.status === "COMPLETED") {
        order.paymentStatus = "paid";
        order.fulfillmentStatus = "paid";
        order.squarePaymentId = payment.id;
        
        order.timeline.push({
          status: "paid",
          note: "Payment completed via Square",
          visibleToCustomer: true,
          createdAt: new Date(),
          createdBy: "system",
        });

        await order.save();

        // Update discount usage
        if (order.discountCode) {
          await Discount.updateOne(
            { code: order.discountCode },
            { $inc: { usedCount: 1 } }
          );
        }

        // Update customer stats
        await Customer.updateOne(
          { _id: order.customerId },
          {
            $inc: { orderCount: 1, totalSpent: order.total },
          }
        );

        // Clear cart if session ID is available (might not be for webhook)
        // Cart clearing already happens on checkout, so this is just a safety net

        // Send confirmation emails
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

        await Promise.all([
          sendOrderConfirmation(emailPayload),
          notifyAdminNewOrder(emailPayload),
        ]);

        console.log(`Square payment completed for order ${order.orderNumber}`);
      }
      
      // Payment failed
      else if (payment.status === "FAILED" || payment.status === "CANCELED") {
        order.paymentStatus = "failed";
        order.timeline.push({
          status: "failed",
          note: `Payment ${payment.status.toLowerCase()} via Square`,
          visibleToCustomer: true,
          createdAt: new Date(),
          createdBy: "system",
        });
        await order.save();
        console.log(`Square payment failed for order ${order.orderNumber}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Square webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 500 }
    );
  }
}
