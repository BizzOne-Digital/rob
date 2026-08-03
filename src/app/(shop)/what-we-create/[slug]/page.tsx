import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CREATION_CATEGORIES,
  PLACEHOLDER_IMAGES,
} from "@/lib/constants";
import {
  getCategoryBySlug,
  getPublishedFaqs,
  getPublishedProducts,
  serialize,
} from "@/lib/data";
import { PageHero } from "@/components/shared/PageHero";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ProcessSteps } from "@/components/shared/ProcessSteps";
import { FaqSection } from "@/components/shared/FaqSection";
import { ImageGrid } from "@/components/shared/ImageGrid";
import { CategoryCard } from "@/components/shared/CategoryCard";
import { CtaBanner } from "@/components/shared/CtaBanner";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RichContent } from "@/components/shared/RichContent";
import { MotionSection } from "@/components/shared/MotionSection";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { FaqJsonLd } from "@/components/seo/FaqJsonLd";

const imageMap: Record<string, string[]> = {
  freshies: [
    PLACEHOLDER_IMAGES.freshie,
    PLACEHOLDER_IMAGES.home,
    PLACEHOLDER_IMAGES.packaging,
    PLACEHOLDER_IMAGES.gift,
    PLACEHOLDER_IMAGES.sparkle,
  ],
  "wax-melts-and-candles": [
    PLACEHOLDER_IMAGES.candle,
    PLACEHOLDER_IMAGES.waxMelts,
    PLACEHOLDER_IMAGES.home,
    PLACEHOLDER_IMAGES.hands,
    PLACEHOLDER_IMAGES.packaging,
  ],
  "beaded-keychains": [
    PLACEHOLDER_IMAGES.keychain,
    PLACEHOLDER_IMAGES.gift,
    PLACEHOLDER_IMAGES.sparkle,
    PLACEHOLDER_IMAGES.packaging,
    PLACEHOLDER_IMAGES.hands,
  ],
  "laser-engraved-items": [
    PLACEHOLDER_IMAGES.engraved,
    PLACEHOLDER_IMAGES.gift,
    PLACEHOLDER_IMAGES.workspace,
    PLACEHOLDER_IMAGES.process,
    PLACEHOLDER_IMAGES.packaging,
  ],
  "wood-signs": [
    PLACEHOLDER_IMAGES.woodSign,
    PLACEHOLDER_IMAGES.home,
    PLACEHOLDER_IMAGES.workspace,
    PLACEHOLDER_IMAGES.process,
    PLACEHOLDER_IMAGES.gift,
  ],
  "custom-creations": [
    PLACEHOLDER_IMAGES.gift,
    PLACEHOLDER_IMAGES.workspace,
    PLACEHOLDER_IMAGES.hands,
    PLACEHOLDER_IMAGES.process,
    PLACEHOLDER_IMAGES.packaging,
  ],
};

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return CREATION_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = serialize(await getCategoryBySlug(slug));
  const fallback = CREATION_CATEGORIES.find((c) => c.slug === slug);
  if (!category && !fallback) return { title: "Not found" };
  return {
    title: category?.seo?.title || category?.name || fallback?.name,
    description:
      category?.seo?.description ||
      category?.summary ||
      fallback?.summary,
  };
}

export default async function CreationCategoryPage({ params }: Props) {
  const { slug } = await params;
  const fallback = CREATION_CATEGORIES.find((c) => c.slug === slug);
  if (!fallback) notFound();

  const [categoryDoc, productsResult, faqs] = await Promise.all([
    getCategoryBySlug(slug),
    getPublishedProducts({ categorySlug: slug, limit: 24 }),
    getPublishedFaqs({ limit: 40 }),
  ]);

  const category = categoryDoc ? serialize(categoryDoc) : null;
  const products = serialize(productsResult.items);
  const name = category?.name || fallback.name;
  const summary = category?.summary || fallback.summary;
  const heroImage =
    category?.heroImage?.url || imageMap[slug]?.[0] || PLACEHOLDER_IMAGES.hero;
  const processSteps =
    category?.creationProcess?.filter((s) => s?.title && s?.description).map((s) => ({
      title: s.title!,
      description: s.description!,
    })) || undefined;

  const serializedFaqs = serialize(faqs);
  const keyword = name.split(" ")[0].toLowerCase();
  const sourceFaqs = category?.faqs?.length
    ? category.faqs.map((f, i) => ({
        _id: String(i),
        question: f.question || "",
        answer: f.answer || "",
      }))
    : serializedFaqs
        .filter(
          (f) =>
            f.category?.toLowerCase().includes(keyword) ||
            f.category === "Products",
        )
        .slice(0, 6)
        .map((f) => ({
          _id: String(f._id),
          question: f.question,
          answer: f.answer,
        }));
  const categoryFaqs = sourceFaqs.filter((f) => f.question && f.answer);

  const related = CREATION_CATEGORIES.filter((c) => c.slug !== slug).slice(0, 3);
  const galleryImages = (imageMap[slug] || Object.values(PLACEHOLDER_IMAGES).slice(0, 5)).map(
    (src, i) => ({ src, alt: `${name} detail ${i + 1}` }),
  );

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "What We Create", path: "/what-we-create" },
          { name, path: `/what-we-create/${slug}` },
        ]}
      />
      <FaqJsonLd faqs={categoryFaqs} />
      <PageHero
        eyebrow={category?.heroEyebrow || "What We Create"}
        title={category?.heroHeading || name}
        description={category?.heroSubheading || summary}
        image={heroImage}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "What We Create", href: "/what-we-create" },
          { label: name },
        ]}
      />

      <MotionSection className="py-16">
        <Container className="max-w-3xl">
          {category?.fullDescription ? (
            <RichContent html={category.fullDescription} />
          ) : (
            <p className="text-lg leading-relaxed text-charcoal/70">{summary}</p>
          )}
        </Container>
      </MotionSection>

      <Container className="pb-12">
        <ImageGrid images={galleryImages} />
      </Container>

      {(category?.options?.length ?? 0) > 0 ? (
        <MotionSection className="py-12">
          <Container>
            <SectionHeading title="Options & details" align="left" />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {category!.options!.map((opt) => (
                <li
                  key={opt}
                  className="rounded-2xl border border-soft-beige bg-white/70 px-5 py-4 text-sm text-charcoal/70"
                >
                  {opt}
                </li>
              ))}
            </ul>
          </Container>
        </MotionSection>
      ) : null}

      <MotionSection className="py-16">
        <Container>
          <SectionHeading
            eyebrow="Shop this collection"
            title={`${name} in the shop`}
            description="Browse published pieces from this collection."
          />
          <div className="mt-12">
            <ProductGrid products={products as never} />
          </div>
        </Container>
      </MotionSection>

      {category?.careInformation ? (
        <MotionSection className="py-12">
          <Container className="max-w-3xl">
            <SectionHeading title="Care" align="left" />
            <p className="mt-6 whitespace-pre-line text-charcoal/70">
              {category.careInformation}
            </p>
            {category.safetyInformation ? (
              <>
                <h3 className="mt-10 font-serif text-2xl">Safety</h3>
                <p className="mt-4 whitespace-pre-line text-charcoal/70">
                  {category.safetyInformation}
                </p>
              </>
            ) : null}
          </Container>
        </MotionSection>
      ) : null}

      <ProcessSteps
        steps={processSteps}
        title={`How we craft ${name.toLowerCase()}`}
      />

      <FaqSection faqs={categoryFaqs} title={`${name} FAQs`} />

      <MotionSection className="py-16">
        <Container>
          <SectionHeading title="You may also love" />
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {related.map((cat) => (
              <CategoryCard
                key={cat.slug}
                name={cat.name}
                summary={cat.summary}
                href={`/what-we-create/${cat.slug}`}
                image={imageMap[cat.slug]?.[0]}
              />
            ))}
          </div>
        </Container>
      </MotionSection>

      <CtaBanner
        title={category?.customOrderCta || "Request a custom piece"}
        description="Share colours, wording, scent, and the feeling you want to create."
        primaryLabel="Start a custom request"
        primaryHref="/contact?type=custom_order"
        secondaryLabel={category?.ctaLabel || "Shop collection"}
        secondaryHref={category?.ctaLink || `/shop?category=${slug}`}
      />
    </>
  );
}
