import { BRAND } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.name,
    url: absoluteUrl(),
    email: BRAND.email,
    telephone: BRAND.phone,
    logo: absoluteUrl("/images/brand/rw-designs-canada-logo.png"),
    sameAs: [BRAND.instagramUrl, BRAND.facebookUrl].filter(Boolean),
    description: BRAND.headline,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
