"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Search, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/lib/admin/api";
import type { AdminListResponse, MediaAssetAdmin } from "@/lib/admin/types";
import type { MediaRef } from "@/types";
import { ConfirmDialog } from "./ConfirmDialog";
import { EmptyState, LoadingState } from "./EmptyState";

interface ImagePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (media: MediaRef) => void;
  multiple?: boolean;
}

export function ImagePicker({ open, onClose, onSelect }: ImagePickerProps) {
  const [items, setItems] = useState<MediaAssetAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "60" });
      if (q.trim()) params.set("q", q.trim());
      const data = await adminFetch<AdminListResponse<MediaAssetAdmin>>(
        `/api/admin/media?${params.toString()}`,
      );
      setItems(data.items);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load media");
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  if (!open) return null;

  async function handleUpload(fileList: FileList | null) {
    if (!fileList?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        const form = new FormData();
        form.append("file", file);
        form.append("alt", file.name);
        await adminFetch("/api/admin/media", { method: "POST", body: form });
      }
      toast.success("Upload complete");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminFetch(`/api/admin/media?id=${deleteId}`, { method: "DELETE" });
      toast.success("Deleted");
      setDeleteId(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  function selectItem(item: MediaAssetAdmin) {
    onSelect({
      url: item.url,
      publicId: item.publicId,
      alt: item.alt || item.filename || "",
      caption: item.caption,
      width: item.width,
      height: item.height,
    });
    onClose();
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied");
    } catch {
      toast.error("Could not copy URL");
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        aria-label="Close media library"
        onClick={onClose}
      />
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-admin-border bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-admin-border px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Media Library</h2>
            <p className="text-xs text-admin-muted">Select an image or upload a new file</p>
          </div>
          <button type="button" className="admin-btn-ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-admin-border px-4 py-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="admin-input pl-9"
              placeholder="Search media…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void load();
              }}
            />
          </div>
          <button type="button" className="admin-btn-secondary" onClick={() => void load()}>
            Search
          </button>
          <label className="admin-btn-primary cursor-pointer">
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading…" : "Upload"}
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              multiple
              disabled={uploading}
              onChange={(e) => void handleUpload(e.target.files)}
            />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <LoadingState />
          ) : items.length === 0 ? (
            <EmptyState
              title="No media yet"
              description="Upload images to use across products, pages, and gallery."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="group relative overflow-hidden rounded-lg border border-admin-border bg-slate-50"
                >
                  <button
                    type="button"
                    className="block w-full"
                    onClick={() => selectItem(item)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={item.alt || item.filename || "Media"}
                      className="aspect-square w-full object-cover"
                    />
                  </button>
                  <div className="flex items-center justify-between gap-1 border-t border-admin-border bg-white px-2 py-1.5">
                    <p className="truncate text-[11px] text-slate-600">
                      {item.filename || "file"}
                    </p>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        className="rounded p-1 text-slate-500 hover:bg-slate-100"
                        title="Copy URL"
                        onClick={() => void copyUrl(item.url)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1 text-rose-500 hover:bg-rose-50"
                        title="Delete"
                        onClick={() => setDeleteId(item._id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete media?"
        description="This permanently removes the file from the library."
        confirmLabel="Delete"
        danger
        loading={deleting}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}

interface ImageFieldProps {
  label: string;
  value?: MediaRef | null;
  onChange: (value: MediaRef | null) => void;
}

export function ImageField({ label, value, onChange }: ImageFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <label className="admin-label">{label}</label>
      <div className="flex items-start gap-3">
        {value?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value.url}
            alt={value.alt || label}
            className="h-20 w-20 rounded-lg border border-admin-border object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-admin-border bg-slate-50 text-xs text-slate-400">
            None
          </div>
        )}
        <div className="flex flex-col gap-2">
          <button type="button" className="admin-btn-secondary" onClick={() => setOpen(true)}>
            Choose image
          </button>
          {value ? (
            <button
              type="button"
              className="admin-btn-ghost text-rose-600"
              onClick={() => onChange(null)}
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
      <ImagePicker open={open} onClose={() => setOpen(false)} onSelect={onChange} />
    </div>
  );
}
