import type { Metadata } from "next";
import { PolicyPage } from "@/components/shared/PolicyPage";

export const metadata: Metadata = {
  title: "Custom Order Policy",
  description: "Custom order policy for RW Designs Canada.",
};

export default function CustomOrderPolicyPage() {
  return <PolicyPage title="Custom Order Policy" field="customOrder" />;
}
