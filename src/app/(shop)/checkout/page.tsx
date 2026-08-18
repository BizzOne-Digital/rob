"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";
import {
  calculateCanadaShippingAmount,
  CANADA_SHIPPING,
  getCanadaShippingDescription,
  getCanadaShippingNote,
} from "@/lib/shipping";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

export default function CheckoutPage() {
  const { items, subtotal, hydrated, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const shippingMethod = "shipping" as const;

  const shippingPrice = useMemo(
    () => calculateCanadaShippingAmount(subtotal, shippingMethod),
    [subtotal],
  );

  const shippingNote = useMemo(
    () => getCanadaShippingNote(subtotal),
    [subtotal],
  );

  const totals = useMemo(
    () => ({
      subtotal,
      shipping: shippingPrice,
      total: subtotal + shippingPrice,
    }),
    [subtotal, shippingPrice],
  );

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    const form = new FormData(e.currentTarget);
    const shippingAddress = {
      fullName: String(form.get("shippingName")),
      email: String(form.get("email")),
      phone: String(form.get("phone") || ""),
      line1: String(form.get("shippingLine1")),
      line2: String(form.get("shippingLine2") || ""),
      city: String(form.get("shippingCity")),
      province: String(form.get("shippingProvince")),
      postalCode: String(form.get("shippingPostal")),
      country: "CA",
    };
    const billingAddress = sameAsShipping
      ? shippingAddress
      : {
          fullName: String(form.get("billingName")),
          email: String(form.get("email")),
          phone: String(form.get("phone") || ""),
          line1: String(form.get("billingLine1")),
          line2: String(form.get("billingLine2") || ""),
          city: String(form.get("billingCity")),
          province: String(form.get("billingProvince")),
          postalCode: String(form.get("billingPostal")),
          country: "CA",
        };

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: shippingAddress.email,
          phone: shippingAddress.phone || undefined,
          shippingAddress,
          billingAddress,
          sameAsShipping,
          shippingMethod: {
            id: shippingMethod,
            name:
              shippingMethod === "pickup"
                ? CANADA_SHIPPING.pickupLabel
                : CANADA_SHIPPING.standardLabel,
            price: shippingPrice,
          },
          discountCode: String(form.get("discountCode") || "") || undefined,
          customerNotes: String(form.get("notes") || "") || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Checkout unavailable");
        setLoading(false);
        return;
      }

      if (data.mode === "stripe" && data.url) {
        window.location.href = data.url;
        return;
      }

      if (data.mode === "square" && data.url) {
        window.location.href = data.url;
        return;
      }

      if (data.mode === "manual" && data.redirectUrl) {
        await clearCart();
        toast.success("Order placed");
        window.location.href = data.redirectUrl;
        return;
      }

      toast.error("Checkout could not be completed");
    } catch {
      toast.error("Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (hydrated && items.length === 0) {
    return (
      <Container className="py-20">
        <EmptyState
          title="Nothing to checkout"
          description="Add a creation with a set price to your cart first."
          actionLabel="What We Create"
          actionHref="/what-we-create"
        />
      </Container>
    );
  }

  return (
    <Container className="py-10 md:py-20">
      <h1 className="font-serif text-2xl text-charcoal sm:text-4xl md:text-5xl">Checkout</h1>
      <p className="mt-3 text-sm text-charcoal/60">
        Enter your details to place your order. You’ll receive a confirmation
        email, and we’ll follow up about payment if needed.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-10 grid min-w-0 gap-8 overflow-x-hidden lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10"
      >
        <div className="space-y-8">
          <section className="rounded-[1.5rem] border border-soft-beige bg-white/70 p-4 sm:p-6">
            <h2 className="font-serif text-2xl">Contact</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Input name="email" type="email" label="Email" required />
              <Input name="phone" type="tel" label="Phone" required />
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-soft-beige bg-white/70 p-4 sm:p-6">
            <h2 className="font-serif text-2xl">Shipping / pickup details</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Input
                name="shippingName"
                label="Full name"
                required
                className="sm:col-span-2"
              />
              <Input
                name="shippingLine1"
                label="Address line 1"
                required
                className="sm:col-span-2"
              />
              <Input
                name="shippingLine2"
                label="Address line 2"
                className="sm:col-span-2"
              />
              <Input name="shippingCity" label="City" required />
              <Input name="shippingProvince" label="Province" required />
              <Input name="shippingPostal" label="Postal code" required />
            </div>
            <div className="mt-5 space-y-2">
              <label className="flex min-h-11 items-center gap-3 rounded-xl px-1 text-sm">
                <input
                  type="radio"
                  name="shipMethod"
                  checked={true}
                  readOnly
                  className="h-4 w-4 shrink-0"
                />
                {getCanadaShippingDescription(subtotal)}
              </label>
              {shippingNote ? (
                <p className="text-xs text-charcoal/50">{shippingNote}</p>
              ) : null}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-soft-beige bg-white/70 p-4 sm:p-6">
            <label className="flex min-h-11 items-center gap-3 px-1 text-sm">
              <input
                type="checkbox"
                checked={sameAsShipping}
                onChange={(e) => setSameAsShipping(e.target.checked)}
              />
              Billing address same as shipping
            </label>
            {!sameAsShipping ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Input
                  name="billingName"
                  label="Full name"
                  required
                  className="sm:col-span-2"
                />
                <Input
                  name="billingLine1"
                  label="Address line 1"
                  required
                  className="sm:col-span-2"
                />
                <Input
                  name="billingLine2"
                  label="Address line 2"
                  className="sm:col-span-2"
                />
                <Input name="billingCity" label="City" required />
                <Input name="billingProvince" label="Province" required />
                <Input name="billingPostal" label="Postal code" required />
              </div>
            ) : null}
          </section>

          <section className="rounded-[1.5rem] border border-soft-beige bg-white/70 p-4 sm:p-6">
            <Input name="discountCode" label="Discount code" />
            <div className="mt-3">
              <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-charcoal/45">
                Order notes
              </label>
              <textarea
                name="notes"
                rows={4}
                className="w-full rounded-2xl border border-soft-beige bg-warm-ivory px-4 py-3 text-sm outline-none"
              />
            </div>
          </section>
        </div>

        <aside className="sticky bottom-0 z-10 -mx-4 border-t border-soft-beige bg-gradient-to-br from-[#eef1ea] to-[#e8e0d6]/95 p-4 backdrop-blur-sm safe-bottom sm:mx-0 sm:rounded-[1.5rem] sm:border sm:p-6 lg:static lg:h-fit lg:border-t-0 lg:bg-gradient-to-br lg:from-[#eef1ea] lg:to-[#e8e0d6]/70 lg:backdrop-blur-none">
          <h2 className="font-serif text-2xl">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item._id} className="flex gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#f7f3ee]">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-contain object-center p-0.5"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-charcoal/50">Qty {item.quantity}</p>
                  {item.personalization?.length ? (
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-charcoal/45">
                      {item.personalization
                        .map((p) => `${p.label}: ${p.value}`)
                        .join(" · ")}
                    </p>
                  ) : null}
                </div>
                <p className="text-sm">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-2 border-t border-white/50 pt-4 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formatCurrency(totals.shipping)}</span>
            </div>
            <div className="flex justify-between font-serif text-lg sm:text-xl">
              <span>Total</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
          <Button type="submit" className="mt-6 w-full !text-white" disabled={loading}>
            {loading ? "Processing…" : "Pay Now"}
          </Button>
        </aside>
      </form>
    </Container>
  );
}

function Input({
  label,
  name,
  type = "text",
  required,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-charcoal/45">
        {label}
        {required ? " *" : ""}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="h-12 w-full rounded-full border border-soft-beige bg-warm-ivory px-4 text-base outline-none focus:border-muted-mauve sm:h-11 sm:text-sm"
      />
    </div>
  );
}
