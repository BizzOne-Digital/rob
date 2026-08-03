import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order status",
  description: "Look up your RW Designs Canada order status.",
};

export default function OrderStatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
