"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ImageField } from "@/components/admin/ImagePicker";
import { UnsavedGuard } from "@/components/admin/UnsavedGuard";
import { ErrorState, LoadingState } from "@/components/admin/EmptyState";
import { adminFetch } from "@/lib/admin/api";
import type { AdminItemResponse, BlogPostAdmin } from "@/lib/admin/types";
import type { MediaRef } from "@/types";

export default function AdminBlogEditPage() {
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [featuredImage, setFeaturedImage] = useState<MediaRef | null>(null);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [baseline, setBaseline] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch<AdminItemResponse<BlogPostAdmin>>(
        `/api/admin/blogs/${params.id}`,
      );
      const item = data.item;
      setTitle(item.title);
      setSlug(item.slug);
      setExcerpt(item.excerpt ?? "");
      setContent(item.content ?? "");
      setAuthor(item.author ?? "");
      setTags((item.tags ?? []).join(", "));
      setStatus(item.status);
      setFeaturedImage(item.featuredImage ?? null);
      setSeoTitle(item.seo?.title ?? "");
      setSeoDescription(item.seo?.description ?? "");
      setBaseline(
        JSON.stringify({
          title: item.title,
          slug: item.slug,
          excerpt: item.excerpt ?? "",
          content: item.content ?? "",
          author: item.author ?? "",
          tags: (item.tags ?? []).join(", "),
          status: item.status,
          featuredImage: item.featuredImage ?? null,
          seoTitle: item.seo?.title ?? "",
          seoDescription: item.seo?.description ?? "",
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load post");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const current = useMemo(
    () =>
      JSON.stringify({
        title,
        slug,
        excerpt,
        content,
        author,
        tags,
        status,
        featuredImage,
        seoTitle,
        seoDescription,
      }),
    [
      title,
      slug,
      excerpt,
      content,
      author,
      tags,
      status,
      featuredImage,
      seoTitle,
      seoDescription,
    ],
  );

  const dirty = baseline !== "" && current !== baseline;

  async function save(nextStatus?: "draft" | "published") {
    setSaving(true);
    try {
      const payload = {
        title,
        slug,
        excerpt,
        content,
        author,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        status: nextStatus ?? status,
        featuredImage,
        seo: {
          title: seoTitle,
          description: seoDescription,
        },
      };
      const data = await adminFetch<AdminItemResponse<BlogPostAdmin>>(
        `/api/admin/blogs/${params.id}`,
        { method: "PATCH", body: JSON.stringify(payload) },
      );
      setStatus(data.item.status);
      setBaseline(JSON.stringify({ ...JSON.parse(current), status: data.item.status }));
      toast.success(
        nextStatus === "published" ? "Post published" : "Draft saved",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <AdminHeader title="Edit blog" />
        <LoadingState />
      </>
    );
  }

  if (error) {
    return (
      <>
        <AdminHeader title="Edit blog" />
        <ErrorState message={error} onRetry={() => void load()} />
      </>
    );
  }

  return (
    <>
      <UnsavedGuard dirty={dirty} />
      <AdminHeader
        title={title || "Edit blog"}
        description="Content is sanitized on the server when saved"
        actions={
          <>
            <Link href="/admin/blogs" className="admin-btn-secondary">
              Back
            </Link>
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
          </>
        }
      />

      <div className="grid gap-4 admin-card p-4 md:grid-cols-2">
        <div>
          <label className="admin-label">Title</label>
          <input
            className="admin-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="admin-label">Slug</label>
          <input
            className="admin-input"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>
        <div>
          <label className="admin-label">Author</label>
          <input
            className="admin-input"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
        <div>
          <label className="admin-label">Tags (comma-separated)</label>
          <input
            className="admin-input"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="admin-label">Excerpt</label>
          <textarea
            className="admin-input min-h-[70px]"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="admin-label">Content (HTML / rich text)</label>
          <textarea
            className="admin-input min-h-[260px] font-mono text-xs"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <ImageField
            label="Featured image"
            value={featuredImage}
            onChange={setFeaturedImage}
          />
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
    </>
  );
}
