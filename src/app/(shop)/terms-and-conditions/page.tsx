import type { Metadata } from "next";
import { PolicyPage } from "@/components/shared/PolicyPage";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for RW Designs Canada.",
};

export default function TermsPage() {
  return <PolicyPage title="Terms & Conditions" field="terms" />;
}
