"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ImageField } from "@/components/admin/ImagePicker";
import { UnsavedGuard } from "@/components/admin/UnsavedGuard";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { adminFetch, idOf } from "@/lib/admin/api";
import type {
  AdminItemResponse,
  AdminListResponse,
  AdminProduct,
  CreationCategoryItem,
  PersonalizationFieldForm,
  ProductVariantForm,
} from "@/lib/admin/types";
import type { MediaRef, ProductStatus } from "@/types";
import { GIFT_OCCASIONS } from "@/lib/constants";
import { nanoid } from "nanoid";

export interface ProductFormValues {
  name: string;
  slug: string;
  categoryId: string;
  shortDescription: string;
  fullDescription: string;
  price: string;
  compareAtPrice: string;
  cost: string;
  priceVisibility: "show" | "contact";
  sku: string;
  inventory: string;
  trackInventory: boolean;
  status: ProductStatus;
  images: MediaRef[];
  videoUrl: string;
  variants: ProductVariantForm[];
  scent: string;
  colour: string;
  size: string;
  material: string;
  waxType: string;
  wickType: string;
  vessel: string;
  burnTime: string;
  dimensions: string;
  personalizable: boolean;
  personalizationFields: PersonalizationFieldForm[];
  productionTime: string;
  careInstructions: string;
  safetyInformation: string;
  shippingInformation: string;
  featured: boolean;
  newArrival: boolean;
  badge: string;
  giftOccasions: string[];
  seoTitle: string;
  seoDescription: string;
}

function emptyForm(): ProductFormValues {
  return {
    name: "",
    slug: "",
    categoryId: "",
    shortDescription: "",
    fullDescription: "",
    price: "",
    compareAtPrice: "",
    cost: "",
    priceVisibility: "contact",
    sku: "",
    inventory: "0",
    trackInventory: true,
    status: "draft",
    images: [],
    videoUrl: "",
    variants: [],
    scent: "",
    colour: "",
    size: "",
    material: "",
    waxType: "",
    wickType: "",
    vessel: "",
    burnTime: "",
    dimensions: "",
    personalizable: false,
    personalizationFields: [],
    productionTime: "",
    careInstructions: "",
    safetyInformation: "",
    shippingInformation: "",
    featured: false,
    newArrival: false,
    badge: "",
    giftOccasions: [],
    seoTitle: "",
    seoDescription: "",
  };
}

function fromProduct(item: AdminProduct): ProductFormValues {
  return {
    name: item.name ?? "",
    slug: item.slug ?? "",
    categoryId: item.categoryId ? String(item.categoryId) : "",
    shortDescription: item.shortDescription ?? "",
    fullDescription: item.fullDescription ?? "",
    price: item.price == null ? "" : String(item.price),
    compareAtPrice: item.compareAtPrice == null ? "" : String(item.compareAtPrice),
    cost: item.cost == null ? "" : String(item.cost),
    priceVisibility: item.priceVisibility ?? "contact",
    sku: item.sku ?? "",
    inventory: String(item.inventory ?? 0),
    trackInventory: item.trackInventory ?? true,
    status: item.status ?? "draft",
    images: item.images ?? [],
    videoUrl: item.videoUrl ?? "",
    variants: (item.variants ?? []).map((v) => ({
      ...v,
      _id: v._id ? String(v._id) : undefined,
    })),
    scent: item.scent ?? "",
    colour: item.colour ?? "",
    size: item.size ?? "",
    material: item.material ?? "",
    waxType: item.waxType ?? "",
    wickType: item.wickType ?? "",
    vessel: item.vessel ?? "",
    burnTime: item.burnTime ?? "",
    dimensions: item.dimensions ?? "",
    personalizable: item.personalizable ?? false,
    personalizationFields: item.personalizationFields ?? [],
    productionTime: item.productionTime ?? "",
    careInstructions: item.careInstructions ?? "",
    safetyInformation: item.safetyInformation ?? "",
    shippingInformation: item.shippingInformation ?? "",
    featured: item.featured ?? false,
    newArrival: item.newArrival ?? false,
    badge: item.badge ?? "",
    giftOccasions: item.giftOccasions ?? [],
    seoTitle: item.seo?.title ?? "",
    seoDescription: item.seo?.description ?? "",
  };
}

function parseNullableNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function toPayload(form: ProductFormValues) {
  return {
    name: form.name.trim(),
    slug: form.slug.trim() || undefined,
    categoryId: form.categoryId || null,
    shortDescription: form.shortDescription,
    fullDescription: form.fullDescription,
    price: parseNullableNumber(form.price),
    compareAtPrice: parseNullableNumber(form.compareAtPrice),
    cost: parseNullableNumber(form.cost),
    priceVisibility: form.priceVisibility,
    sku: form.sku,
    inventory: Number(form.inventory) || 0,
    trackInventory: form.trackInventory,
    status: form.status,
    images: form.images.filter((img) => img.url),
    videoUrl: form.videoUrl || null,
    variants: form.variants,
    scent: form.scent,
    colour: form.colour,
    size: form.size,
    material: form.material,
    waxType: form.waxType,
    wickType: form.wickType,
    vessel: form.vessel,
    burnTime: form.burnTime,
    dimensions: form.dimensions,
    personalizable: form.personalizable,
    personalizationFields: form.personalizationFields,
    productionTime: form.productionTime,
    careInstructions: form.careInstructions,
    safetyInformation: form.safetyInformation,
    shippingInformation: form.shippingInformation,
    featured: form.featured,
    newArrival: form.newArrival,
    badge: form.badge || null,
    giftOccasions: form.giftOccasions,
    seo: {
      title: form.seoTitle,
      description: form.seoDescription,
    },
  };
}

interface ProductFormProps {
  productId?: string;
}

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const isNew = !productId;
  const [form, setForm] = useState<ProductFormValues>(emptyForm());
  const [categories, setCategories] = useState<CreationCategoryItem[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [baseline, setBaseline] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null);

  useEffect(() => {
    void adminFetch<AdminListResponse<CreationCategoryItem>>("/api/admin/categories")
      .then((data) => setCategories(data.items))
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  useEffect(() => {
    if (!productId) {
      const blank = emptyForm();
      setForm(blank);
      setBaseline(JSON.stringify(blank));
      return;
    }

    let cancelled = false;
    setLoading(true);
    void adminFetch<AdminItemResponse<AdminProduct>>(`/api/admin/products/${productId}`)
      .then((data) => {
        if (cancelled) return;
        const next = fromProduct(data.item);
        setForm(next);
        setBaseline(JSON.stringify(next));
        setLoadedSlug(data.item.slug);
      })
      .catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : "Failed to load product");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const dirty = useMemo(
    () => baseline !== "" && JSON.stringify(form) !== baseline,
    [baseline, form],
  );

  function patch<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save(statusOverride?: ProductStatus) {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...toPayload(form),
        status: statusOverride ?? form.status,
      };

      if (isNew) {
        const data = await adminFetch<AdminItemResponse<AdminProduct>>(
          "/api/admin/products",
          { method: "POST", body: JSON.stringify(payload) },
        );
        toast.success("Product created");
        router.push(`/admin/products/${idOf(data.item)}`);
      } else {
        await adminFetch(`/api/admin/products/${productId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success(statusOverride === "published" ? "Published" : "Saved");
        setBaseline(JSON.stringify({ ...form, status: payload.status }));
        setForm((prev) => ({ ...prev, status: payload.status }));
        if (payload.slug) setLoadedSlug(payload.slug);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!productId) return;
    setDeleting(true);
    try {
      await adminFetch(`/api/admin/products/${productId}`, { method: "DELETE" });
      toast.success("Product deleted");
      router.push("/admin/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-admin-border bg-white px-6 py-16 text-center text-sm text-admin-muted">
        Loading product…
      </div>
    );
  }

  return (
    <>
      <UnsavedGuard dirty={dirty} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link href="/admin/products" className="admin-btn-secondary">
          Back
        </Link>
        {loadedSlug ? (
          <a
            href={`/shop/${loadedSlug}`}
            target="_blank"
            rel="noreferrer"
            className="admin-btn-secondary"
          >
            Preview
          </a>
        ) : null}
        <button
          type="button"
          className="admin-btn-secondary"
          disabled={saving}
          onClick={() => void save("draft")}
        >
          Save draft
        </button>
        <button
          type="button"
          className="admin-btn-primary"
          disabled={saving}
          onClick={() => void save("published")}
        >
          Publish
        </button>
        {!isNew ? (
          <button
            type="button"
            className="admin-btn-danger"
            onClick={() => setConfirmDelete(true)}
          >
            Delete
          </button>
        ) : null}
      </div>

      {dirty ? (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          You have unsaved changes.
        </p>
      ) : null}

      <div className="space-y-6">
        <section className="admin-card grid gap-4 p-4 md:grid-cols-2">
          <h2 className="md:col-span-2 text-sm font-semibold text-slate-900">Basics</h2>
          <div>
            <label className="admin-label">Name</label>
            <input
              className="admin-input"
              value={form.name}
              onChange={(e) => patch("name", e.target.value)}
            />
          </div>
          <div>
            <label className="admin-label">Slug</label>
            <input
              className="admin-input"
              value={form.slug}
              onChange={(e) => patch("slug", e.target.value)}
              placeholder="auto from name"
            />
          </div>
          <div>
            <label className="admin-label">Category</label>
            <select
              className="admin-input"
              value={form.categoryId}
              onChange={(e) => patch("categoryId", e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-label">Status</label>
            <select
              className="admin-input"
              value={form.status}
              onChange={(e) => patch("status", e.target.value as ProductStatus)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="admin-label">Short description</label>
            <textarea
              className="admin-input min-h-[70px]"
              value={form.shortDescription}
              onChange={(e) => patch("shortDescription", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="admin-label">Full description</label>
            <textarea
              className="admin-input min-h-[120px]"
              value={form.fullDescription}
              onChange={(e) => patch("fullDescription", e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => patch("featured", e.target.checked)}
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.newArrival}
              onChange={(e) => patch("newArrival", e.target.checked)}
            />
            New arrival
          </label>
          <div>
            <label className="admin-label">Badge</label>
            <input
              className="admin-input"
              value={form.badge}
              onChange={(e) => patch("badge", e.target.value)}
            />
          </div>
        </section>

        <section className="admin-card grid gap-4 p-4 md:grid-cols-3">
          <h2 className="md:col-span-3 text-sm font-semibold text-slate-900">Pricing & inventory</h2>
          <div>
            <label className="admin-label">Price</label>
            <input
              className="admin-input"
              value={form.price}
              onChange={(e) => patch("price", e.target.value)}
            />
          </div>
          <div>
            <label className="admin-label">Compare-at</label>
            <input
              className="admin-input"
              value={form.compareAtPrice}
              onChange={(e) => patch("compareAtPrice", e.target.value)}
            />
          </div>
          <div>
            <label className="admin-label">Cost</label>
            <input
              className="admin-input"
              value={form.cost}
              onChange={(e) => patch("cost", e.target.value)}
            />
          </div>
          <div>
            <label className="admin-label">Price visibility</label>
            <select
              className="admin-input"
              value={form.priceVisibility}
              onChange={(e) =>
                patch("priceVisibility", e.target.value as "show" | "contact")
              }
            >
              <option value="show">Show</option>
              <option value="contact">Contact for price</option>
            </select>
          </div>
          <div>
            <label className="admin-label">SKU</label>
            <input
              className="admin-input"
              value={form.sku}
              onChange={(e) => patch("sku", e.target.value)}
            />
          </div>
          <div>
            <label className="admin-label">Inventory</label>
            <input
              className="admin-input"
              value={form.inventory}
              onChange={(e) => patch("inventory", e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm md:col-span-3">
            <input
              type="checkbox"
              checked={form.trackInventory}
              onChange={(e) => patch("trackInventory", e.target.checked)}
            />
            Track inventory
          </label>
        </section>

        <section className="admin-card space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Images</h2>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() =>
                patch("images", [...form.images, { url: "", alt: form.name || "Product" }])
              }
            >
              <Plus className="h-4 w-4" /> Add image
            </button>
          </div>
          {form.images.map((img, index) => (
            <div key={`${img.url}-${index}`} className="rounded-lg border border-admin-border p-3">
              <ImageField
                label={`Image ${index + 1}`}
                value={img.url ? img : null}
                onChange={(next) => {
                  const images = [...form.images];
                  if (!next) images.splice(index, 1);
                  else images[index] = next;
                  patch("images", images);
                }}
              />
            </div>
          ))}
          <div>
            <label className="admin-label">Video URL</label>
            <input
              className="admin-input"
              value={form.videoUrl}
              onChange={(e) => patch("videoUrl", e.target.value)}
            />
          </div>
        </section>

        <section className="admin-card space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Variants</h2>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() =>
                patch("variants", [
                  ...form.variants,
                  {
                    name: `Variant ${form.variants.length + 1}`,
                    price: null,
                    inventory: 0,
                    trackInventory: true,
                    available: true,
                  },
                ])
              }
            >
              <Plus className="h-4 w-4" /> Add variant
            </button>
          </div>
          {form.variants.map((variant, index) => (
            <div
              key={variant._id ?? `v-${index}`}
              className="grid gap-3 rounded-lg border border-admin-border p-3 md:grid-cols-4"
            >
              <div>
                <label className="admin-label">Name</label>
                <input
                  className="admin-input"
                  value={variant.name}
                  onChange={(e) => {
                    const variants = [...form.variants];
                    variants[index] = { ...variant, name: e.target.value };
                    patch("variants", variants);
                  }}
                />
              </div>
              <div>
                <label className="admin-label">SKU</label>
                <input
                  className="admin-input"
                  value={variant.sku ?? ""}
                  onChange={(e) => {
                    const variants = [...form.variants];
                    variants[index] = { ...variant, sku: e.target.value };
                    patch("variants", variants);
                  }}
                />
              </div>
              <div>
                <label className="admin-label">Price</label>
                <input
                  className="admin-input"
                  value={variant.price == null ? "" : String(variant.price)}
                  onChange={(e) => {
                    const variants = [...form.variants];
                    variants[index] = {
                      ...variant,
                      price: parseNullableNumber(e.target.value),
                    };
                    patch("variants", variants);
                  }}
                />
              </div>
              <div>
                <label className="admin-label">Inventory</label>
                <input
                  className="admin-input"
                  value={String(variant.inventory ?? 0)}
                  onChange={(e) => {
                    const variants = [...form.variants];
                    variants[index] = {
                      ...variant,
                      inventory: Number(e.target.value) || 0,
                    };
                    patch("variants", variants);
                  }}
                />
              </div>
              <button
                type="button"
                className="admin-btn-ghost text-rose-600 md:col-span-4"
                onClick={() =>
                  patch(
                    "variants",
                    form.variants.filter((_, i) => i !== index),
                  )
                }
              >
                <Trash2 className="h-4 w-4" /> Remove variant
              </button>
            </div>
          ))}
        </section>

        <section className="admin-card grid gap-4 p-4 md:grid-cols-3">
          <h2 className="md:col-span-3 text-sm font-semibold text-slate-900">Attributes</h2>
          {(
            [
              ["scent", "Scent"],
              ["colour", "Colour"],
              ["size", "Size"],
              ["material", "Material"],
              ["waxType", "Wax type"],
              ["wickType", "Wick type"],
              ["vessel", "Vessel"],
              ["burnTime", "Burn time"],
              ["dimensions", "Dimensions"],
              ["productionTime", "Production time"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="admin-label">{label}</label>
              <input
                className="admin-input"
                value={form[key]}
                onChange={(e) => patch(key, e.target.value)}
              />
            </div>
          ))}
        </section>

        <section className="admin-card space-y-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Personalization</h2>
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.personalizable}
                  onChange={(e) => patch("personalizable", e.target.checked)}
                />
                Enable personalization fields
              </label>
            </div>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() =>
                patch("personalizationFields", [
                  ...form.personalizationFields,
                  {
                    id: nanoid(8),
                    label: "Custom text",
                    type: "text",
                    required: false,
                  },
                ])
              }
            >
              <Plus className="h-4 w-4" /> Add field
            </button>
          </div>
          {form.personalizationFields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 rounded-lg border border-admin-border p-3 md:grid-cols-4"
            >
              <div>
                <label className="admin-label">Label</label>
                <input
                  className="admin-input"
                  value={field.label}
                  onChange={(e) => {
                    const fields = [...form.personalizationFields];
                    fields[index] = { ...field, label: e.target.value };
                    patch("personalizationFields", fields);
                  }}
                />
              </div>
              <div>
                <label className="admin-label">Type</label>
                <select
                  className="admin-input"
                  value={field.type}
                  onChange={(e) => {
                    const fields = [...form.personalizationFields];
                    fields[index] = {
                      ...field,
                      type: e.target.value as PersonalizationFieldForm["type"],
                    };
                    patch("personalizationFields", fields);
                  }}
                >
                  <option value="text">Text</option>
                  <option value="textarea">Textarea</option>
                  <option value="select">Select</option>
                  <option value="file">File</option>
                  <option value="color">Color</option>
                </select>
              </div>
              <div>
                <label className="admin-label">Placeholder</label>
                <input
                  className="admin-input"
                  value={field.placeholder ?? ""}
                  onChange={(e) => {
                    const fields = [...form.personalizationFields];
                    fields[index] = { ...field, placeholder: e.target.value };
                    patch("personalizationFields", fields);
                  }}
                />
              </div>
              <label className="flex items-end gap-2 pb-2 text-sm">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => {
                    const fields = [...form.personalizationFields];
                    fields[index] = { ...field, required: e.target.checked };
                    patch("personalizationFields", fields);
                  }}
                />
                Required
              </label>
              {field.type === "select" ? (
                <div className="md:col-span-4">
                  <label className="admin-label">Options (comma-separated)</label>
                  <input
                    className="admin-input"
                    value={(field.options ?? []).join(", ")}
                    onChange={(e) => {
                      const fields = [...form.personalizationFields];
                      fields[index] = {
                        ...field,
                        options: e.target.value
                          .split(",")
                          .map((o) => o.trim())
                          .filter(Boolean),
                      };
                      patch("personalizationFields", fields);
                    }}
                  />
                </div>
              ) : null}
              <button
                type="button"
                className="admin-btn-ghost text-rose-600 md:col-span-4"
                onClick={() =>
                  patch(
                    "personalizationFields",
                    form.personalizationFields.filter((_, i) => i !== index),
                  )
                }
              >
                <Trash2 className="h-4 w-4" /> Remove field
              </button>
            </div>
          ))}
        </section>

        <section className="admin-card grid gap-4 p-4 md:grid-cols-1">
          <h2 className="text-sm font-semibold text-slate-900">Care & safety</h2>
          <div>
            <label className="admin-label">Care instructions</label>
            <textarea
              className="admin-input min-h-[80px]"
              value={form.careInstructions}
              onChange={(e) => patch("careInstructions", e.target.value)}
            />
          </div>
          <div>
            <label className="admin-label">Safety information</label>
            <textarea
              className="admin-input min-h-[80px]"
              value={form.safetyInformation}
              onChange={(e) => patch("safetyInformation", e.target.value)}
            />
          </div>
          <div>
            <label className="admin-label">Shipping information</label>
            <textarea
              className="admin-input min-h-[80px]"
              value={form.shippingInformation}
              onChange={(e) => patch("shippingInformation", e.target.value)}
            />
          </div>
        </section>

        <section className="admin-card space-y-3 p-4">
          <h2 className="text-sm font-semibold text-slate-900">Gift occasions</h2>
          <div className="flex flex-wrap gap-3">
            {GIFT_OCCASIONS.map((occ) => {
              const checked = form.giftOccasions.includes(occ.slug);
              return (
                <label key={occ.slug} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      patch(
                        "giftOccasions",
                        e.target.checked
                          ? [...form.giftOccasions, occ.slug]
                          : form.giftOccasions.filter((g) => g !== occ.slug),
                      );
                    }}
                  />
                  {occ.name}
                </label>
              );
            })}
          </div>
        </section>

        <section className="admin-card grid gap-4 p-4 md:grid-cols-2">
          <h2 className="md:col-span-2 text-sm font-semibold text-slate-900">SEO</h2>
          <div>
            <label className="admin-label">SEO title</label>
            <input
              className="admin-input"
              value={form.seoTitle}
              onChange={(e) => patch("seoTitle", e.target.value)}
            />
          </div>
          <div>
            <label className="admin-label">SEO description</label>
            <input
              className="admin-input"
              value={form.seoDescription}
              onChange={(e) => patch("seoDescription", e.target.value)}
            />
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete product?"
        description="This permanently removes the product and its pricing rows."
        confirmLabel="Delete"
        danger
        loading={deleting}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}
