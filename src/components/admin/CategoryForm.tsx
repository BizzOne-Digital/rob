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
  CreationCategoryItem,
} from "@/lib/admin/types";
import type { MediaRef } from "@/types";

interface CategoryFormState {
  name: string;
  slug: string;
  summary: string;
  fullDescription: string;
  heroEyebrow: string;
  heroHeading: string;
  heroSubheading: string;
  heroImage: MediaRef | null;
  images: MediaRef[];
  creationProcess: Array<{ title: string; description: string }>;
  careInformation: string;
  safetyInformation: string;
  faqs: Array<{ question: string; answer: string }>;
  options: string;
  ctaLabel: string;
  ctaLink: string;
  customOrderCta: string;
  displayOrder: string;
  active: boolean;
  seoTitle: string;
  seoDescription: string;
}

function emptyState(): CategoryFormState {
  return {
    name: "",
    slug: "",
    summary: "",
    fullDescription: "",
    heroEyebrow: "",
    heroHeading: "",
    heroSubheading: "",
    heroImage: null,
    images: [],
    creationProcess: [],
    careInformation: "",
    safetyInformation: "",
    faqs: [],
    options: "",
    ctaLabel: "Shop this collection",
    ctaLink: "",
    customOrderCta: "Request a custom piece",
    displayOrder: "0",
    active: true,
    seoTitle: "",
    seoDescription: "",
  };
}

function fromItem(item: CreationCategoryItem): CategoryFormState {
  return {
    name: item.name ?? "",
    slug: item.slug ?? "",
    summary: item.summary ?? "",
    fullDescription: item.fullDescription ?? "",
    heroEyebrow: item.heroEyebrow ?? "",
    heroHeading: item.heroHeading ?? "",
    heroSubheading: item.heroSubheading ?? "",
    heroImage: item.heroImage ?? null,
    images: item.images ?? [],
    creationProcess: item.creationProcess ?? [],
    careInformation: item.careInformation ?? "",
    safetyInformation: item.safetyInformation ?? "",
    faqs: item.faqs ?? [],
    options: (item.options ?? []).join("\n"),
    ctaLabel: item.ctaLabel ?? "Shop this collection",
    ctaLink: item.ctaLink ?? "",
    customOrderCta: item.customOrderCta ?? "Request a custom piece",
    displayOrder: String(item.displayOrder ?? 0),
    active: item.active ?? true,
    seoTitle: item.seo?.title ?? "",
    seoDescription: item.seo?.description ?? "",
  };
}

function toPayload(form: CategoryFormState) {
  return {
    name: form.name.trim(),
    slug: form.slug.trim() || undefined,
    summary: form.summary.trim(),
    fullDescription: form.fullDescription,
    heroEyebrow: form.heroEyebrow,
    heroHeading: form.heroHeading,
    heroSubheading: form.heroSubheading,
    heroImage: form.heroImage,
    images: form.images.filter((img) => img.url),
    creationProcess: form.creationProcess,
    careInformation: form.careInformation,
    safetyInformation: form.safetyInformation,
    faqs: form.faqs,
    options: form.options
      .split("\n")
      .map((o) => o.trim())
      .filter(Boolean),
    ctaLabel: form.ctaLabel,
    ctaLink: form.ctaLink,
    customOrderCta: form.customOrderCta,
    displayOrder: Number(form.displayOrder) || 0,
    active: form.active,
    seo: {
      title: form.seoTitle,
      description: form.seoDescription,
    },
  };
}

interface CategoryFormProps {
  categoryId?: string;
  backHref?: string;
}

export function CategoryForm({
  categoryId,
  backHref = "/admin/what-we-create",
}: CategoryFormProps) {
  const router = useRouter();
  const isNew = !categoryId;
  const [form, setForm] = useState<CategoryFormState>(emptyState());
  const [baseline, setBaseline] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!categoryId) {
      const blank = emptyState();
      setForm(blank);
      setBaseline(JSON.stringify(blank));
      return;
    }
    let cancelled = false;
    setLoading(true);
    void adminFetch<AdminItemResponse<CreationCategoryItem>>(
      `/api/admin/categories/${categoryId}`,
    )
      .then((data) => {
        if (cancelled) return;
        const next = fromItem(data.item);
        setForm(next);
        setBaseline(JSON.stringify(next));
      })
      .catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const dirty = useMemo(
    () => baseline !== "" && JSON.stringify(form) !== baseline,
    [baseline, form],
  );

  function patch<K extends keyof CategoryFormState>(
    key: K,
    value: CategoryFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    if (!form.name.trim() || !form.summary.trim()) {
      toast.error("Name and summary are required");
      return;
    }
    setSaving(true);
    try {
      const payload = toPayload(form);
      if (isNew) {
        const data = await adminFetch<AdminItemResponse<CreationCategoryItem>>(
          "/api/admin/categories",
          { method: "POST", body: JSON.stringify(payload) },
        );
        toast.success("Category created");
        router.push(`${backHref}/${idOf(data.item)}`);
      } else {
        await adminFetch(`/api/admin/categories/${categoryId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Category saved");
        setBaseline(JSON.stringify(form));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!categoryId) return;
    setDeleting(true);
    try {
      await adminFetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });
      toast.success("Deleted");
      router.push(backHref);
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
        Loading…
      </div>
    );
  }

  return (
    <>
      <UnsavedGuard dirty={dirty} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href={backHref} className="admin-btn-secondary">
          Back
        </Link>
        <button
          type="button"
          className="admin-btn-primary"
          disabled={saving}
          onClick={() => void save()}
        >
          {saving ? "Saving…" : "Save"}
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

      <div className="space-y-6">
        <section className="admin-card grid gap-4 p-4 md:grid-cols-2">
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
            />
          </div>
          <div className="md:col-span-2">
            <label className="admin-label">Summary</label>
            <textarea
              className="admin-input min-h-[80px]"
              value={form.summary}
              onChange={(e) => patch("summary", e.target.value)}
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
          <div>
            <label className="admin-label">Display order</label>
            <input
              className="admin-input"
              value={form.displayOrder}
              onChange={(e) => patch("displayOrder", e.target.value)}
            />
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => patch("active", e.target.checked)}
            />
            Active
          </label>
        </section>

        <section className="admin-card grid gap-4 p-4 md:grid-cols-2">
          <h2 className="md:col-span-2 text-sm font-semibold">Hero</h2>
          <div>
            <label className="admin-label">Eyebrow</label>
            <input
              className="admin-input"
              value={form.heroEyebrow}
              onChange={(e) => patch("heroEyebrow", e.target.value)}
            />
          </div>
          <div>
            <label className="admin-label">Heading</label>
            <input
              className="admin-input"
              value={form.heroHeading}
              onChange={(e) => patch("heroHeading", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="admin-label">Subheading</label>
            <input
              className="admin-input"
              value={form.heroSubheading}
              onChange={(e) => patch("heroSubheading", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <ImageField
              label="Hero image"
              value={form.heroImage}
              onChange={(v) => patch("heroImage", v)}
            />
          </div>
        </section>

        <section className="admin-card space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Gallery images</h2>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() =>
                patch("images", [...form.images, { url: "", alt: form.name }])
              }
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
          {form.images.map((img, i) => (
            <ImageField
              key={`${img.url}-${i}`}
              label={`Image ${i + 1}`}
              value={img.url ? img : null}
              onChange={(next) => {
                const images = [...form.images];
                if (!next) images.splice(i, 1);
                else images[i] = next;
                patch("images", images);
              }}
            />
          ))}
        </section>

        <section className="admin-card space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Creation process</h2>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() =>
                patch("creationProcess", [
                  ...form.creationProcess,
                  { title: "", description: "" },
                ])
              }
            >
              <Plus className="h-4 w-4" /> Add step
            </button>
          </div>
          {form.creationProcess.map((step, i) => (
            <div key={i} className="grid gap-3 rounded-lg border p-3 md:grid-cols-2">
              <input
                className="admin-input"
                placeholder="Title"
                value={step.title}
                onChange={(e) => {
                  const next = [...form.creationProcess];
                  next[i] = { ...step, title: e.target.value };
                  patch("creationProcess", next);
                }}
              />
              <input
                className="admin-input"
                placeholder="Description"
                value={step.description}
                onChange={(e) => {
                  const next = [...form.creationProcess];
                  next[i] = { ...step, description: e.target.value };
                  patch("creationProcess", next);
                }}
              />
              <button
                type="button"
                className="admin-btn-ghost text-rose-600 md:col-span-2"
                onClick={() =>
                  patch(
                    "creationProcess",
                    form.creationProcess.filter((_, idx) => idx !== i),
                  )
                }
              >
                <Trash2 className="h-4 w-4" /> Remove
              </button>
            </div>
          ))}
        </section>

        <section className="admin-card space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">FAQs</h2>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() =>
                patch("faqs", [...form.faqs, { question: "", answer: "" }])
              }
            >
              <Plus className="h-4 w-4" /> Add FAQ
            </button>
          </div>
          {form.faqs.map((faq, i) => (
            <div key={i} className="space-y-2 rounded-lg border p-3">
              <input
                className="admin-input"
                placeholder="Question"
                value={faq.question}
                onChange={(e) => {
                  const next = [...form.faqs];
                  next[i] = { ...faq, question: e.target.value };
                  patch("faqs", next);
                }}
              />
              <textarea
                className="admin-input min-h-[70px]"
                placeholder="Answer"
                value={faq.answer}
                onChange={(e) => {
                  const next = [...form.faqs];
                  next[i] = { ...faq, answer: e.target.value };
                  patch("faqs", next);
                }}
              />
            </div>
          ))}
        </section>

        <section className="admin-card grid gap-4 p-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="admin-label">Options (one per line)</label>
            <textarea
              className="admin-input min-h-[80px]"
              value={form.options}
              onChange={(e) => patch("options", e.target.value)}
            />
          </div>
          <div>
            <label className="admin-label">Care information</label>
            <textarea
              className="admin-input min-h-[80px]"
              value={form.careInformation}
              onChange={(e) => patch("careInformation", e.target.value)}
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
            <label className="admin-label">CTA label</label>
            <input
              className="admin-input"
              value={form.ctaLabel}
              onChange={(e) => patch("ctaLabel", e.target.value)}
            />
          </div>
          <div>
            <label className="admin-label">CTA link</label>
            <input
              className="admin-input"
              value={form.ctaLink}
              onChange={(e) => patch("ctaLink", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="admin-label">Custom order CTA</label>
            <input
              className="admin-input"
              value={form.customOrderCta}
              onChange={(e) => patch("customOrderCta", e.target.value)}
            />
          </div>
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
        title="Delete category?"
        description="This cannot be undone."
        confirmLabel="Delete"
        danger
        loading={deleting}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}
