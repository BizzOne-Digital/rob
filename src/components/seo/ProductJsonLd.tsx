import { isValidPrice } from "@/lib/utils";
import { absoluteUrl } from "@/lib/utils";
import { BRAND } from "@/lib/constants";

export function ProductJsonLd({
  product,
}: {
  product: {
    name: string;
    slug: string;
    shortDescription?: string | null;
    fullDescription?: string | null;
    price?: number | null;
    priceVisibility?: string | null;
    images?: Array<{ url: string; alt?: string }>;
  };
}) {
  const hasPrice =
    product.priceVisibility !== "contact" && isValidPrice(product.price);

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.shortDescription || product.fullDescription || undefined,
    image: product.images?.map((img) => absoluteUrl(img.url)),
    brand: {
      "@type": "Brand",
      name: BRAND.name,
    },
    url: absoluteUrl(`/shop/${product.slug}`),
  };

  if (hasPrice) {
    data.offers = {
      "@type": "Offer",
      priceCurrency: "CAD",
      price: product.price,
      availability: "https://schema.org/InStock",
      url: absoluteUrl(`/shop/${product.slug}`),
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
