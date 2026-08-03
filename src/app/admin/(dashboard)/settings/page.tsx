import { AdminHeader } from "@/components/admin/AdminHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default function AdminSettingsPage() {
  return (
    <>
      <AdminHeader
        title="Settings"
        description="Business, branding, shipping, tax, SEO, analytics, policies, and Stripe"
      />
      <SettingsForm />
    </>
  );
}
