import { CtaBanner } from "@/components/shared/CtaBanner";

export function FinalCta() {
  return (
    <CtaBanner
      title="Find a piece that feels like home"
      description="Browse handmade creations, explore custom options, or reach out — we’d love to help you choose something meaningful."
      primaryLabel="Shop now"
      primaryHref="/what-we-create"
      secondaryLabel="Contact us"
      secondaryHref="/contact"
    />
  );
}
