import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { WhatWeCreateGrid } from "@/components/home/WhatWeCreateGrid";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { AboutPreview } from "@/components/home/AboutPreview";
import { HandmadeProcess } from "@/components/home/HandmadeProcess";
import { CustomCreationsTeaser } from "@/components/home/CustomCreationsTeaser";
import { GiftInspiration } from "@/components/home/GiftInspiration";
import { GalleryPreview } from "@/components/home/GalleryPreview";
import { HomeSocialProof } from "@/components/home/HomeSocialProof";
import {
  getApprovedTestimonials,
  getFeaturedProducts,
  getGalleryItems,
  getPublishedCategories,
  getPublishedFaqs,
  getSettings,
  serialize,
} from "@/lib/data";
import { BRAND } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  const settings = serialize(await getSettings());
  return {
    title:
      settings.defaultSeo?.title ||
      `${BRAND.name} | Beautifully Handmade Gifts`,
    description:
      settings.defaultSeo?.description ||
      "Discover handcrafted candles, wax melts, personalized gifts, and custom creations by RW Designs Canada.",
  };
}

export default async function HomePage() {
  const [settingsDoc, categories, featured, gallery, testimonials, faqs] =
    await Promise.all([
      getSettings(),
      getPublishedCategories(),
      getFeaturedProducts(8),
      getGalleryItems(8),
      getApprovedTestimonials({ featured: true, limit: 6 }),
      getPublishedFaqs({ featured: true, limit: 5 }),
    ]);

  const settings = serialize(settingsDoc);

  return (
    <>
      <Hero headline={settings.headline} />
      <CategoryStrip />
      <WhatWeCreateGrid categories={serialize(categories)} />
      <FeaturedProducts products={serialize(featured)} />
      <AboutPreview />
      <HandmadeProcess />
      <CustomCreationsTeaser />
      <GiftInspiration />
      <GalleryPreview items={serialize(gallery)} />
      <HomeSocialProof
        testimonials={serialize(testimonials)}
        faqs={serialize(faqs)}
      />
    </>
  );
}
