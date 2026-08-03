import { revalidatePath, revalidateTag } from "next/cache";

export function revalidateSite() {
  revalidatePath("/", "layout");
  revalidateTag("settings");
  revalidateTag("navigation");
}

export function revalidateShop() {
  revalidatePath("/what-we-create");
  revalidatePath("/collections", "layout");
  revalidateTag("products");
}

export function revalidateProduct(slug: string) {
  revalidatePath(`/what-we-create/${slug}`);
  revalidateShop();
}

export function revalidateCategories() {
  revalidatePath("/what-we-create");
  revalidatePath("/what-we-create", "layout");
  revalidateTag("categories");
}

export function revalidateGallery() {
  revalidatePath("/");
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
