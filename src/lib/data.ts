import { connectDB } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";
import { CreationCategory } from "@/models/CreationCategory";
import { FAQ } from "@/models/FAQ";
import { Page } from "@/models/Page";
import { Product } from "@/models/Product";
import { GalleryItem } from "@/models/GalleryItem";
import { Testimonial } from "@/models/Testimonial";
import { BlogPost } from "@/models/Blog";
import type { SiteSettingsDocument } from "@/models/SiteSettings";

export async function getSettings(): Promise<SiteSettingsDocument> {
  await connectDB();
  let settings = await SiteSettings.findOne({ singletonKey: "site" });
  if (!settings) {
    settings = await SiteSettings.create({});
  }
  return settings;
}

export async function getPublishedCategories() {
  await connectDB();
  return CreationCategory.find({ active: true }).sort({ displayOrder: 1 }).lean();
}

export async function getCategoryBySlug(slug: string) {
  await connectDB();
  return CreationCategory.findOne({ slug, active: true }).lean();
}

export async function getPublishedProducts(filters?: {
  categorySlug?: string;
  featured?: boolean;
  search?: string;
  personalizable?: boolean;
  availability?: "in_stock" | "all" | "contact";
  minPrice?: number;
  maxPrice?: number;
  giftOccasion?: string;
  limit?: number;
  skip?: number;
  sort?: string;
}) {
  await connectDB();
  const query: Record<string, unknown> = { status: "published" };
  const andClauses: Record<string, unknown>[] = [];

  if (filters?.categorySlug) query.categorySlug = filters.categorySlug;
  if (filters?.featured) query.featured = true;
  if (filters?.personalizable) query.personalizable = true;
  if (filters?.giftOccasion) query.giftOccasions = filters.giftOccasion;

  if (filters?.search) {
    andClauses.push({
      $or: [
        { name: { $regex: filters.search, $options: "i" } },
        { shortDescription: { $regex: filters.search, $options: "i" } },
        { scent: { $regex: filters.search, $options: "i" } },
        { colour: { $regex: filters.search, $options: "i" } },
      ],
    });
  }

  if (filters?.availability === "in_stock") {
    query.priceVisibility = "show";
    andClauses.push({ price: { $ne: null, $gte: 0 } });
    andClauses.push({
      $or: [{ trackInventory: false }, { inventory: { $gt: 0 } }],
    });
  } else if (filters?.availability === "contact") {
    andClauses.push({
      $or: [{ priceVisibility: "contact" }, { price: null }],
    });
  }

  if (filters?.minPrice != null || filters?.maxPrice != null) {
    const priceQuery: Record<string, number> = {};
    if (filters.minPrice != null) priceQuery.$gte = filters.minPrice;
    if (filters.maxPrice != null) priceQuery.$lte = filters.maxPrice;
    query.price = priceQuery;
    query.priceVisibility = "show";
  }

  if (andClauses.length) query.$and = andClauses;

  let sort: Record<string, 1 | -1> = { createdAt: -1 };
  if (filters?.sort === "price-asc") sort = { price: 1 };
  if (filters?.sort === "price-desc") sort = { price: -1 };
  if (filters?.sort === "name") sort = { name: 1 };
  if (filters?.sort === "featured") sort = { featured: -1, createdAt: -1 };
  if (filters?.sort === "newest") sort = { createdAt: -1 };

  const limit = filters?.limit ?? 24;
  const skip = filters?.skip ?? 0;

  const [items, total] = await Promise.all([
    Product.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(query),
  ]);

  return { items, total };
}

export async function getProductBySlug(slug: string) {
  await connectDB();
  return Product.findOne({ slug, status: "published" }).lean();
}

export async function getFeaturedProducts(limit = 8) {
  await connectDB();
  return Product.find({ status: "published", featured: true })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();
}

export async function getPublishedFaqs(options?: {
  featured?: boolean;
  category?: string;
  limit?: number;
}) {
  await connectDB();
  const query: Record<string, unknown> = { published: true };
  if (options?.featured) query.featured = true;
  if (options?.category) query.category = options.category;
  return FAQ.find(query)
    .sort({ displayOrder: 1 })
    .limit(options?.limit ?? 100)
    .lean();
}

export async function getPageBySlug(slug: string) {
  await connectDB();
  return Page.findOne({ slug, status: "published" }).lean();
}

export async function getGalleryItems(limit?: number) {
  await connectDB();
  const q = GalleryItem.find({ published: true }).sort({ displayOrder: 1 });
  if (limit) q.limit(limit);
  return q.lean();
}

export async function getApprovedTestimonials(options?: {
  featured?: boolean;
  limit?: number;
}) {
  await connectDB();
  const query: Record<string, unknown> = { approved: true };
  if (options?.featured) query.featured = true;
  return Testimonial.find(query)
    .sort({ displayOrder: 1, createdAt: -1 })
    .limit(options?.limit ?? 50)
    .lean();
}

export async function getPublishedPosts(limit = 12) {
  await connectDB();
  return BlogPost.find({ status: "published" })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();
}

export async function getPostBySlug(slug: string) {
  await connectDB();
  return BlogPost.findOne({ slug, status: "published" }).lean();
}

export function serialize<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}
