import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProductBySlug,
  getPublishedProducts,
  serialize,
} from "@/lib/data";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { AddToCartForm } from "@/components/shop/AddToCartForm";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { RichContent } from "@/components/shared/RichContent";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
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

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const productDoc = await getProductBySlug(slug);
  if (!productDoc) notFound();
  const product = serialize(productDoc);

  const related = serialize(
    (
      await getPublishedProducts({
        categorySlug: product.categorySlug || undefined,
        limit: 4,
      })
    ).items.filter((p) => String(p._id) !== String(product._id)),
  );

  const images =
    product.images?.length
      ? product.images.map((img) => ({
          url: img.url,
          alt: img.alt || product.name,
        }))
      : [{ url: PLACEHOLDER_IMAGES.sparkle, alt: product.name }];

  return (
    <>
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: product.name, path: `/shop/${product.slug}` },
        ]}
      />

      <Container className="py-10 md:py-16">
        <Breadcrumbs
          className="mb-8"
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            ...(product.categorySlug
              ? [
                  {
                    label: product.categorySlug.replace(/-/g, " "),
                    href: `/what-we-create/${product.categorySlug}`,
                  },
                ]
              : []),
            { label: product.name },
          ]}
        />

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <ProductGallery images={images} name={product.name} />
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              {product.badge ? <Badge tone="charcoal">{product.badge}</Badge> : null}
              {product.personalizable ? (
                <Badge tone="mauve">Personalizable</Badge>
              ) : null}
              {product.newArrival ? <Badge tone="blue">New</Badge> : null}
            </div>
            <h1 className="font-serif text-4xl text-charcoal md:text-5xl">
              {product.name}
            </h1>
            {product.shortDescription ? (
              <p className="mt-4 text-base leading-relaxed text-charcoal/65">
                {product.shortDescription}
              </p>
            ) : null}

            <div className="mt-8">
              <AddToCartForm product={product as never} />
            </div>

            <dl className="mt-8 grid gap-3 text-sm text-charcoal/65 sm:grid-cols-2">
              {product.scent ? (
                <div><dt className="text-xs uppercase tracking-[0.14em] text-charcoal/40">Scent</dt><dd>{product.scent}</dd></div>
              ) : null}
              {product.colour ? (
                <div><dt className="text-xs uppercase tracking-[0.14em] text-charcoal/40">Colour</dt><dd>{product.colour}</dd></div>
              ) : null}
              {product.material ? (
                <div><dt className="text-xs uppercase tracking-[0.14em] text-charcoal/40">Material</dt><dd>{product.material}</dd></div>
              ) : null}
              {product.dimensions ? (
                <div><dt className="text-xs uppercase tracking-[0.14em] text-charcoal/40">Dimensions</dt><dd>{product.dimensions}</dd></div>
              ) : null}
              {product.burnTime ? (
                <div><dt className="text-xs uppercase tracking-[0.14em] text-charcoal/40">Burn time</dt><dd>{product.burnTime}</dd></div>
              ) : null}
              {product.productionTime ? (
                <div><dt className="text-xs uppercase tracking-[0.14em] text-charcoal/40">Production</dt><dd>{product.productionTime}</dd></div>
              ) : null}
            </dl>
          </div>
        </div>

        {(product.fullDescription ||
          product.careInstructions ||
          product.safetyInformation ||
          product.shippingInformation) && (
          <div className="mt-16 grid gap-10 lg:grid-cols-2">
            {product.fullDescription ? (
              <div>
                <h2 className="font-serif text-3xl">Details</h2>
                <div className="mt-4">
                  <RichContent html={product.fullDescription} />
                </div>
              </div>
            ) : null}
            <div className="space-y-8">
              {product.careInstructions ? (
                <div>
                  <h2 className="font-serif text-2xl">Care</h2>
                  <p className="mt-3 whitespace-pre-line text-charcoal/65">
                    {product.careInstructions}
                  </p>
                </div>
              ) : null}
              {product.safetyInformation ? (
                <div>
                  <h2 className="font-serif text-2xl">Safety</h2>
                  <p className="mt-3 whitespace-pre-line text-charcoal/65">
                    {product.safetyInformation}
                  </p>
                </div>
              ) : null}
              {product.shippingInformation ? (
                <div>
                  <h2 className="font-serif text-2xl">Shipping</h2>
                  <p className="mt-3 whitespace-pre-line text-charcoal/65">
                    {product.shippingInformation}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        )}

        <div className="mt-16 grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            PLACEHOLDER_IMAGES.packaging,
            PLACEHOLDER_IMAGES.hands,
            PLACEHOLDER_IMAGES.home,
            PLACEHOLDER_IMAGES.process,
            PLACEHOLDER_IMAGES.sparkle,
          ].map((src) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-2xl bg-powder-blue/30">
              <ImageWithFallback src={src} alt="" fill sizes="20vw" />
            </div>
          ))}
        </div>

        {related.length > 0 ? (
          <div className="mt-20">
            <SectionHeading title="You may also like" />
            <div className="mt-10">
              <ProductGrid products={related as never} />
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/shop"
                className="text-xs font-medium uppercase tracking-[0.16em] text-muted-mauve hover:underline"
              >
                Back to shop
              </Link>
            </div>
          </div>
        ) : null}
      </Container>
    </>
  );
}
