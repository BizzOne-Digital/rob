"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cart";

export function OrderSuccessClient() {
  const searchParams = useSearchParams();
  const order =
    searchParams.get("order") || searchParams.get("orderNumber") || undefined;
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    void clearCart();
  }, [clearCart]);

  return (
    <Container className="py-20 text-center">
      <p className="font-script text-4xl text-muted-mauve">Thank you</p>
      <h1 className="mt-3 font-serif text-4xl text-charcoal md:text-5xl">
        Your order is confirmed
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-charcoal/65">
        We’ve received your order
        {order ? (
          <>
            {" "}
            <strong className="text-charcoal">{order}</strong>
          </>
        ) : null}
        . A confirmation email is on its way, and our studio has been notified.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {order ? (
          <Button
            href={`/order-status?orderNumber=${encodeURIComponent(order)}`}
            className="!text-white"
          >
            Check order status
          </Button>
        ) : (
          <Button href="/order-status" className="!text-white">
            Check order status
          </Button>
        )}
        <Button href="/what-we-create" variant="outline">
          Continue shopping
        </Button>
      </div>
      <p className="mt-6 text-sm text-charcoal/50">
        Need help?{" "}
        <Link
          href="/contact"
          className="underline underline-offset-2 hover:text-muted-mauve"
        >
          Contact us
        </Link>
      </p>
    </Container>
  );
}
