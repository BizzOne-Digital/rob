import type { Metadata } from "next";
import { PolicyPage } from "@/components/shared/PolicyPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for RW Designs Canada.",
};

export default function PrivacyPolicyPage() {
  return <PolicyPage title="Privacy Policy" field="privacy" />;
}
