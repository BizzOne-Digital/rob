import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping cart",
  description: "Review your handmade selections from RW Designs Canada.",
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
