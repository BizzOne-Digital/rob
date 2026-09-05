import { revalidatePath, revalidateTag } from "next/cache";

const SHOP_PATHS = [
  "/",
  "/what-we-create",
  "/gallery",
  "/wishlist",
  "/about",
  "/contact",
  "/collections",
] as const;

export function revalidateSite() {
  for (const path of SHOP_PATHS) {
    revalidatePath(path);
    revalidatePath(path, "layout");
  }
  revalidateTag("settings");
  revalidateTag("navigation");
}

export function revalidateShop() {
  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/what-we-create");
  revalidatePath("/what-we-create", "layout");
  revalidatePath("/collections", "layout");
  revalidatePath("/wishlist");
  revalidateTag("products");
}

export function revalidateProduct(slug: string) {
  revalidatePath(`/what-we-create/${slug}`);
  revalidateShop();
}

export function revalidateCategories() {
  revalidatePath("/what-we-create");
  revalidatePath("/what-we-create", "layout");
  revalidatePath("/about");
  revalidateTag("categories");
}

export function revalidateGallery() {
  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidateTag("gallery");
}

export function revalidateTestimonials() {
  revalidatePath("/");
  revalidateTag("testimonials");
}

export function revalidateBlog(slug?: string) {
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
  revalidateTag("blog");
}

export function revalidatePage(path: string) {
  revalidatePath(path);
  revalidateTag("pages");
}

export function revalidateAfterSettingsChange() {
  revalidateSite();
  revalidatePath("/contact");
  revalidatePath("/checkout");
  revalidatePath("/privacy-policy");
  revalidatePath("/terms-and-conditions");
  revalidatePath("/shipping-and-returns");
  revalidatePath("/custom-order-policy");
}
