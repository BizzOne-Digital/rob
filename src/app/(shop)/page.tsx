import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { AboutPreview } from "@/components/home/AboutPreview";
import { CustomCreationsTeaser } from "@/components/home/CustomCreationsTeaser";
import { GalleryPreview } from "@/components/home/GalleryPreview";
import { HomeSocialProof } from "@/components/home/HomeSocialProof";
import {
  getApprovedTestimonials,
  getPublishedFaqs,
  getPublishedProducts,
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
  const [settingsDoc, productsResult, testimonials, faqs] = await Promise.all([
    getSettings(),
    getPublishedProducts({ limit: 6, sort: "newest" }),
    getApprovedTestimonials({ featured: true, limit: 6 }),
    getPublishedFaqs({ featured: true, limit: 5 }),
  ]);

  const settings = serialize(settingsDoc);

  return (
    <>
      <Hero headline={settings.headline} />
      <CategoryStrip />
      <FeaturedProducts products={serialize(productsResult.items)} />
      <AboutPreview />
      <CustomCreationsTeaser />
      <GalleryPreview />
      <HomeSocialProof
        testimonials={serialize(testimonials)}
        faqs={serialize(faqs)}
      />
    </>
  );
}
