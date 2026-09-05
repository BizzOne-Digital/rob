"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import type { UploadFolder } from "@/lib/stored-uploads";
import type { MediaRef } from "@/types";

interface UploadResponse {
  success: boolean;
  url: string;
  filename: string;
  size: number;
  folder: string;
  error?: string;
}

async function deleteStoredUrl(url: string) {
  if (!url.startsWith("/api/uploads/")) return;

  await fetch("/api/upload", {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
}

interface MongoImageFieldProps {
  label: string;
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: UploadFolder;
  accept?: string;
}

export function MongoImageField({
  label,
  value,
  onChange,
  folder = "misc",
  accept = "image/png,image/jpeg,image/webp,image/gif",
}: MongoImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    setUploading(true);
    const previousUrl = value;

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
        credentials: "include",
      });

      const payload = (await res.json()) as UploadResponse;
      if (!res.ok) {
        throw new Error(payload.error || "Upload failed");
      }

      if (previousUrl?.startsWith("/api/uploads/")) {
        await deleteStoredUrl(previousUrl);
      }

      onChange(payload.url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    if (!value) return;

    try {
      if (value.startsWith("/api/uploads/")) {
        await deleteStoredUrl(value);
      }
      onChange(null);
      toast.success("Image removed");
    } catch {
      toast.error("Could not remove image");
    }
  }

  return (
    <div>
      <label className="admin-label">{label}</label>
      <div className="flex items-start gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt={label}
            className="h-20 w-20 rounded-lg border border-admin-border object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-admin-border bg-slate-50 text-xs text-slate-400">
            None
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label className="admin-btn-secondary cursor-pointer">
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              disabled={uploading}
              onChange={(e) => void handleFile(e.target.files)}
            />
          </label>
          {value ? (
            <button
              type="button"
              className="admin-btn-ghost text-rose-600"
              disabled={uploading}
              onClick={() => void handleRemove()}
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Alias matching the LocalImageField naming used in upload specs. */
export { MongoImageField as LocalImageField };

export function MongoMediaField({
  label,
  value,
  onChange,
  folder = "misc",
  alt,
}: {
  label: string;
  value?: MediaRef | null;
  onChange: (value: MediaRef | null) => void;
  folder?: UploadFolder;
  alt?: string;
}) {
  return (
    <MongoImageField
      label={label}
      folder={folder}
      value={value?.url ?? null}
      onChange={(url) =>
        onChange(
          url
            ? {
                url,
                alt: alt || value?.alt || label,
                caption: value?.caption,
                publicId: value?.publicId,
                width: value?.width,
                height: value?.height,
              }
            : null,
        )
      }
    />
  );
}
