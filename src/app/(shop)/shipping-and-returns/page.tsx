import type { Metadata } from "next";
import { PolicyPage } from "@/components/shared/PolicyPage";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "Shipping and returns information for RW Designs Canada.",
};

export default function ShippingReturnsPage() {
  return <PolicyPage title="Shipping & Returns" field="shippingReturns" />;
}
