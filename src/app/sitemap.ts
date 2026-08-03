import type { MetadataRoute } from "next";
import { CREATION_CATEGORIES, GIFT_OCCASIONS } from "@/lib/constants";
import {
  getPublishedPosts,
  getPublishedProducts,
} from "@/lib/data";

function abs(path: string) {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/about",
    "/what-we-create",
    "/shop",
    "/gallery",
    "/testimonials",
    "/faq",
    "/blog",
    "/contact",
    "/cart",
    "/checkout",
    "/order-status",
    "/wishlist",
    "/privacy-policy",
    "/terms-and-conditions",
    "/shipping-and-returns",
    "/custom-order-policy",
    ...CREATION_CATEGORIES.map((c) => `/what-we-create/${c.slug}`),
    ...GIFT_OCCASIONS.map((g) => `/collections/${g.slug}`),
  ];

  let productEntries: MetadataRoute.Sitemap = [];
  let postEntries: MetadataRoute.Sitemap = [];

  try {
    const [{ items }, posts] = await Promise.all([
      getPublishedProducts({ limit: 500 }),
      getPublishedPosts(100),
    ]);
    productEntries = items.map((p) => ({
      url: abs(`/shop/${p.slug}`),
      lastModified: p.updatedAt ? new Date(p.updatedAt as Date) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
    postEntries = posts.map((p) => ({
      url: abs(`/blog/${p.slug}`),
      lastModified: p.updatedAt
        ? new Date(p.updatedAt as Date)
        : p.publishedAt
          ? new Date(p.publishedAt as Date)
          : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));
  } catch {
    /* DB may be unavailable at build time */
  }

  return [
    ...staticRoutes.map((path) => ({
      url: abs(path || "/"),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...productEntries,
    ...postEntries,
  ];
}
