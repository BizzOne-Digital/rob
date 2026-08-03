"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ImageField } from "@/components/admin/ImagePicker";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ErrorState, LoadingState } from "@/components/admin/EmptyState";
import { adminFetch, idOf } from "@/lib/admin/api";
import type {
  AdminListResponse,
  GalleryItemAdmin,
} from "@/lib/admin/types";
import type { MediaRef } from "@/types";

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItemAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<MediaRef | null>(null);
  const [category, setCategory] = useState("");
  const [behindTheScenes, setBehindTheScenes] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch<AdminListResponse<GalleryItemAdmin>>(
        "/api/admin/gallery",
      );
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load gallery");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createItem() {
    if (!title.trim() || !image?.url) {
      toast.error("Title and image are required");
      return;
    }
    setCreating(true);
    try {
      await adminFetch("/api/admin/gallery", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          caption,
          image,
          category: category || undefined,
          behindTheScenes,
          published: true,
          displayOrder: items.length,
        }),
      });
      toast.success("Gallery item added");
      setTitle("");
      setCaption("");
      setImage(null);
      setCategory("");
      setBehindTheScenes(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  async function updateItem(
    id: string,
    patch: Partial<{
      title: string;
      caption: string;
      displayOrder: number;
      published: boolean;
      behindTheScenes: boolean;
    }>,
  ) {
    try {
      await adminFetch(`/api/admin/gallery/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminFetch(`/api/admin/gallery/${deleteId}`, { method: "DELETE" });
      toast.success("Deleted");
      setDeleteId(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <AdminHeader
        title="Gallery"
        description="Manage gallery images and display order"
      />

      <section className="admin-card mb-6 grid gap-4 p-4 md:grid-cols-2">
        <h2 className="md:col-span-2 text-sm font-semibold">Add gallery item</h2>
        <div>
          <label className="admin-label">Title</label>
          <input
            className="admin-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="admin-label">Category</label>
          <input
            className="admin-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="admin-label">Caption</label>
          <input
            className="admin-input"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <ImageField label="Image" value={image} onChange={setImage} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={behindTheScenes}
            onChange={(e) => setBehindTheScenes(e.target.checked)}
          />
          Behind the scenes
        </label>
        <div className="flex items-end">
          <button
            type="button"
            className="admin-btn-primary"
            disabled={creating}
            onClick={() => void createItem()}
          >
            <Plus className="h-4 w-4" />
            {creating ? "Adding…" : "Add item"}
          </button>
        </div>
      </section>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item._id} className="admin-card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image.url}
                alt={item.image.alt || item.title}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="space-y-2 p-3">
                <input
                  className="admin-input"
                  value={item.title}
                  onChange={(e) => {
                    setItems((prev) =>
                      prev.map((row) =>
                        row._id === item._id
                          ? { ...row, title: e.target.value }
                          : row,
                      ),
                    );
                  }}
                  onBlur={(e) =>
                    void updateItem(item._id, { title: e.target.value })
                  }
                />
                <div className="flex items-center gap-2">
                  <label className="text-xs text-admin-muted">Order</label>
                  <input
                    type="number"
                    className="admin-input w-20"
                    value={item.displayOrder ?? 0}
                    onChange={(e) => {
                      const displayOrder = Number(e.target.value) || 0;
                      setItems((prev) =>
                        prev.map((row) =>
                          row._id === item._id ? { ...row, displayOrder } : row,
                        ),
                      );
                    }}
                    onBlur={(e) =>
                      void updateItem(item._id, {
                        displayOrder: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.published ?? false}
                      onChange={(e) =>
                        void updateItem(item._id, {
                          published: e.target.checked,
                        })
                      }
                    />
                    Published
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.behindTheScenes ?? false}
                      onChange={(e) =>
                        void updateItem(item._id, {
                          behindTheScenes: e.target.checked,
                        })
                      }
                    />
                    BTS
                  </label>
                  <button
                    type="button"
                    className="admin-btn-ghost text-rose-600"
                    onClick={() => setDeleteId(idOf(item))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete gallery item?"
        confirmLabel="Delete"
        danger
        loading={deleting}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}
