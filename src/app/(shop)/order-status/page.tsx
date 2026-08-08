"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

function OrderStatusForm() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(
    () => searchParams.get("orderNumber") ?? "",
  );
  const [email, setEmail] = useState(() => searchParams.get("email") ?? "");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<{
    orderNumber: string;
    fulfillmentStatus: string;
    paymentStatus: string;
    trackingNumber?: string;
    customerVisibleNotes?: string;
    items: Array<{ name: string; quantity: number; price: number; variantLabel?: string }>;
    total: number;
    currency: string;
    timeline: Array<{ status: string; note?: string; createdAt?: string }>;
  } | null>(null);

  const lookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setOrder(null);
    try {
      const res = await fetch(
        `/api/order-status?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Order not found");
      } else {
        setOrder(data.order);
      }
    } catch {
      toast.error("Could not look up order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-14 md:py-20">
      <h1 className="font-serif text-4xl text-charcoal md:text-5xl">Order status</h1>
      <p className="mt-3 max-w-xl text-charcoal/65">
        Enter your order number and the email used at checkout to view status updates.
      </p>

      <form
        onSubmit={lookup}
        className="mt-8 grid max-w-xl gap-3 rounded-[1.5rem] border border-soft-beige bg-white/70 p-6 sm:grid-cols-[1fr_1fr_auto]"
      >
        <input
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="Order number"
          required
          className="h-11 rounded-full border border-soft-beige bg-warm-ivory px-4 text-sm outline-none"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="h-11 rounded-full border border-soft-beige bg-warm-ivory px-4 text-sm outline-none"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Looking…" : "Look up"}
        </Button>
      </form>

      {order ? (
        <div className="mt-10 max-w-2xl rounded-[1.5rem] border border-soft-beige bg-white/80 p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-mauve">
            {order.orderNumber}
          </p>
          <h2 className="mt-2 font-serif text-3xl capitalize">
            {order.fulfillmentStatus.replace(/_/g, " ")}
          </h2>
          <p className="mt-1 text-sm text-charcoal/55">
            Payment: {order.paymentStatus}
            {order.trackingNumber ? ` · Tracking: ${order.trackingNumber}` : ""}
          </p>
          {order.customerVisibleNotes ? (
            <p className="mt-4 text-sm text-charcoal/70">{order.customerVisibleNotes}</p>
          ) : null}
          <ul className="mt-6 space-y-2 border-t border-soft-beige pt-4">
            {order.items.map((item, i) => (
              <li key={`${item.name}-${i}`} className="flex justify-between text-sm">
                <span>
                  {item.name}
                  {item.variantLabel ? ` (${item.variantLabel})` : ""} × {item.quantity}
                </span>
                <span>{formatCurrency(item.price * item.quantity, order.currency)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-right font-serif text-2xl">
            {formatCurrency(order.total, order.currency)}
          </p>
          {order.timeline?.length ? (
            <div className="mt-6 border-t border-soft-beige pt-4">
              <h3 className="text-xs uppercase tracking-[0.14em] text-charcoal/45">Timeline</h3>
              <ul className="mt-3 space-y-2 text-sm text-charcoal/65">
                {order.timeline.map((event, i) => (
                  <li key={`${event.status}-${i}`}>
                    <span className="capitalize">{event.status.replace(/_/g, " ")}</span>
                    {event.note ? ` — ${event.note}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </Container>
  );
}

export default function OrderStatusPage() {
  return (
    <Suspense fallback={<Container className="py-20">Loading…</Container>}>
      <OrderStatusForm />
    </Suspense>
  );
}
