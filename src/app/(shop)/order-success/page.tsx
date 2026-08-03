import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderSuccessClient } from "./OrderSuccessClient";

export const metadata: Metadata = {
  title: "Order success",
  description: "Thank you for your order with RW Designs Canada.",
};

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={null}>
      <OrderSuccessClient />
    </Suspense>
  );
}
