"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { PageSectionEditor } from "@/components/admin/PageSectionEditor";
import { UnsavedGuard } from "@/components/admin/UnsavedGuard";
import { ErrorState, LoadingState } from "@/components/admin/EmptyState";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { adminFetch } from "@/lib/admin/api";
import type { AdminItemResponse, AdminPage, PageSection } from "@/lib/admin/types";

export default function AdminPageEditorPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();

  const [page, setPage] = useState<AdminPage | null>(null);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [sections, setSections] = useState<PageSection[]>([]);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [showInNav, setShowInNav] = useState(true);
  const [navLabel, setNavLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [baseline, setBaseline] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch<AdminItemResponse<AdminPage>>(
        `/api/admin/pages/${slug}`,
      );
      const item = data.item;
      setPage(item);
      setTitle(item.title);
      setStatus(item.status);
      setSections(
        [...(item.sections ?? [])].sort(
          (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
        ),
      );
      setSeoTitle(item.seo?.title ?? "");
      setSeoDescription(item.seo?.description ?? "");
      setShowInNav(item.showInNav ?? true);
      setNavLabel(item.navLabel ?? "");
      setBaseline(
        JSON.stringify({
          title: item.title,
          status: item.status,
          sections: item.sections ?? [],
          seoTitle: item.seo?.title ?? "",
          seoDescription: item.seo?.description ?? "",
          showInNav: item.showInNav ?? true,
          navLabel: item.navLabel ?? "",
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load page");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const dirty = useMemo(() => {
    if (!baseline) return false;
    return (
      JSON.stringify({
        title,
        status,
        sections,
        seoTitle,
        seoDescription,
        showInNav,
        navLabel,
      }) !== baseline
    );
  }, [baseline, title, status, sections, seoTitle, seoDescription, showInNav, navLabel]);

  async function save(nextStatus?: "draft" | "published") {
    setSaving(true);
    try {
      const payload = {
        title,
        status: nextStatus ?? status,
        sections: sections.map((s, i) => ({
          ...s,
          displayOrder: i,
          images: (s.images ?? []).filter((img) => img.url),
        })),
        seo: {
          title: seoTitle,
          description: seoDescription,
        },
        showInNav,
        navLabel,
      };
      const data = await adminFetch<AdminItemResponse<AdminPage>>(
        `/api/admin/pages/${slug}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        },
      );
      toast.success(nextStatus === "published" ? "Page published" : "Draft saved");
      setStatus(data.item.status);
      setBaseline(
        JSON.stringify({
          title,
          status: data.item.status,
          sections,
          seoTitle,
          seoDescription,
          showInNav,
          navLabel,
        }),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await adminFetch(`/api/admin/pages/${slug}`, { method: "DELETE" });
      toast.success("Page deleted");
      router.push("/admin/pages");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  if (loading) {
    return (
      <>
        <AdminHeader title="Edit page" />
        <LoadingState />
      </>
    );
  }

  if (error || !page) {
    return (
      <>
        <AdminHeader title="Edit page" />
        <ErrorState message={error || "Not found"} onRetry={() => void load()} />
      </>
    );
  }

  return (
    <>
      <UnsavedGuard dirty={dirty} />
      <AdminHeader
        title={title || page.title}
        description={`Editing /${page.slug}`}
        actions={
          <>
            <Link href="/admin/pages" className="admin-btn-secondary">
              Back
            </Link>
            <a
              href={page.path}
              target="_blank"
              rel="noreferrer"
              className="admin-btn-secondary"
            >
              Preview
            </a>
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
            <button
              type="button"
              className="admin-btn-danger"
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </button>
          </>
        }
      />

      {dirty ? (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          You have unsaved changes.
        </p>
      ) : null}

      <div className="mb-6 grid gap-4 admin-card p-4 md:grid-cols-2">
        <div>
          <label className="admin-label">Title</label>
          <input
            className="admin-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="admin-label">Status</label>
          <select
            className="admin-input"
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div>
          <label className="admin-label">Nav label</label>
          <input
            className="admin-input"
            value={navLabel}
            onChange={(e) => setNavLabel(e.target.value)}
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={showInNav}
              onChange={(e) => setShowInNav(e.target.checked)}
            />
            Show in navigation
          </label>
        </div>
        <div>
          <label className="admin-label">SEO title</label>
          <input
            className="admin-input"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="admin-label">SEO description</label>
          <input
            className="admin-input"
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
          />
        </div>
      </div>

      <PageSectionEditor sections={sections} onChange={setSections} />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this page?"
        description="This cannot be undone."
        confirmLabel="Delete page"
        danger
        loading={deleting}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}
