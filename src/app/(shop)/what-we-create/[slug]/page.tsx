import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProductBySlug,
  getPublishedProducts,
  serialize,
} from "@/lib/data";
import { ProductDetailInteractive } from "@/components/shop/ProductDetailInteractive";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { ProductDetailsAccordion } from "@/components/shop/ProductDetailsAccordion";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = serialize(await getProductBySlug(slug));
  if (!product) return { title: "Product not found" };
  return {
    title: product.seo?.title || product.name,
    description:
      product.seo?.description ||
      product.shortDescription ||
      `${product.name} by RW Designs Canada`,
  };
}

function plainTextBlock(text: string) {
  return (
    <p className="whitespace-pre-line">{text}</p>
  );
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const productDoc = await getProductBySlug(slug);
  if (!productDoc) notFound();
  const product = serialize(productDoc);

  const relatedRaw = (
    await getPublishedProducts({
      categorySlug: product.categorySlug || undefined,
      limit: 8,
    })
  ).items.filter((p) => String(p._id) !== String(product._id));

  const relatedPool =
    relatedRaw.length > 0
      ? relatedRaw
      : (
          await getPublishedProducts({ limit: 8 })
        ).items.filter((p) => String(p._id) !== String(product._id));

  const related = serialize(relatedPool.slice(0, 4));

  const images =
    product.images?.length
      ? product.images.map((img) => ({
          url: img.url,
          alt: img.alt || product.name,
        }))
      : [{ url: PLACEHOLDER_IMAGES.sparkle, alt: product.name }];

  const featureRows = [
    product.scent ? ["Scent", product.scent] : null,
    product.colour ? ["Colour", product.colour] : null,
    product.size ? ["Size", product.size] : null,
    product.dimensions ? ["Dimensions", product.dimensions] : null,
    product.waxType ? ["Wax", product.waxType] : null,
    product.wickType ? ["Wick", product.wickType] : null,
    product.burnTime ? ["Burn time", product.burnTime] : null,
    product.productionTime ? ["Production time", product.productionTime] : null,
  ].filter(Boolean) as Array<[string, string]>;

  const accordionItems = [
    product.fullDescription
      ? {
          id: "description",
          title: "Product description",
          content: (
            <div className="prose prose-invert max-w-none prose-p:text-white/70 prose-headings:font-serif prose-headings:text-[#f3efe8]">
              <div
                dangerouslySetInnerHTML={{
                  __html: product.fullDescription.includes("<")
                    ? product.fullDescription
                    : product.fullDescription.replace(/\n/g, "<br/>"),
                }}
              />
            </div>
          ),
        }
      : product.shortDescription
        ? {
            id: "description",
            title: "Product description",
            content: plainTextBlock(product.shortDescription),
          }
        : null,
    featureRows.length
      ? {
          id: "features",
          title: "Features",
          content: (
            <ul className="space-y-2">
              {featureRows.map(([label, value]) => (
                <li key={label}>
                  <span className="text-white/45">{label}: </span>
                  {value}
                </li>
              ))}
            </ul>
          ),
        }
      : null,
    product.material
      ? {
          id: "materials",
          title: "Materials",
          content: plainTextBlock(product.material),
        }
      : null,
    product.careInstructions
      ? {
          id: "care",
          title: "Care instructions",
          content: plainTextBlock(product.careInstructions),
        }
      : null,
    product.safetyInformation || product.shippingInformation
      ? {
          id: "details",
          title: "Safety & shipping",
          content: (
            <div className="space-y-4">
              {product.safetyInformation
                ? plainTextBlock(product.safetyInformation)
                : null}
              {product.shippingInformation
                ? plainTextBlock(product.shippingInformation)
                : null}
            </div>
          ),
        }
      : null,
  ].filter(Boolean) as Array<{
    id: string;
    title: string;
    content: ReactNode;
  }>;

  return (
    <>
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "What We Create", path: "/what-we-create" },
          { name: product.name, path: `/what-we-create/${product.slug}` },
        ]}
      />

      <Container className="py-8 md:py-16">
        <Breadcrumbs
          className="mb-8"
          items={[
            { label: "Home", href: "/" },
            { label: "What We Create", href: "/what-we-create" },
            ...(product.categorySlug
              ? [
                  {
                    label: product.categorySlug.replace(/-/g, " "),
                    href: `/what-we-create?category=${product.categorySlug}`,
                  },
                ]
              : []),
            { label: product.name },
          ]}
        />

        <ProductDetailInteractive product={product as never} images={images}>
          <div className="mb-4 flex flex-wrap gap-2">
            {product.newArrival ? <Badge tone="blue">New</Badge> : null}
            {product.featured ? <Badge tone="mauve">Best</Badge> : null}
            {product.badge ? <Badge tone="charcoal">{product.badge}</Badge> : null}
            {product.personalizable ? (
              <Badge tone="mauve">Customization</Badge>
            ) : null}
          </div>
          <h1 className="break-words text-balance font-serif text-2xl text-charcoal sm:text-3xl md:text-4xl lg:text-5xl">
            {product.name}
          </h1>
          {product.shortDescription ? (
            <p className="mt-4 text-base leading-relaxed text-charcoal/65">
              {product.shortDescription}
            </p>
          ) : null}
        </ProductDetailInteractive>
      </Container>

      {accordionItems.length > 0 ? (
        <ProductDetailsAccordion items={accordionItems} className="mt-4" />
      ) : null}

      {related.length > 0 ? (
        <Container className="py-16 md:py-20">
          <SectionHeading title="You may also like" />
          <div className="mt-10">
            <ProductGrid products={related as never} />
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/what-we-create"
              className="text-xs font-medium uppercase tracking-[0.16em] text-muted-mauve hover:underline"
            >
              Back to What We Create
            </Link>
          </div>
        </Container>
      ) : null}
    </>
  );
}
