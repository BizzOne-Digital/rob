import { randomBytes } from "crypto";
import path from "path";
import { unlink } from "fs/promises";
import { connectDB } from "@/lib/db";
import { StoredUpload } from "@/models/StoredUpload";

export const UPLOAD_FOLDERS = ["products", "gallery", "pages", "misc"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export const ALLOWED_MIME_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
} as const;

export type AllowedMimeType = keyof typeof ALLOWED_MIME_TYPES;

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const LEGACY_UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

export function normalizeUploadFolder(folder?: string | null): UploadFolder {
  const cleaned = (folder || "misc").toLowerCase().trim();
  return UPLOAD_FOLDERS.includes(cleaned as UploadFolder)
    ? (cleaned as UploadFolder)
    : "misc";
}

export function isAllowedMimeType(mimeType: string): mimeType is AllowedMimeType {
  return mimeType in ALLOWED_MIME_TYPES;
}

export function generateStoredFilename(mimeType: AllowedMimeType): string {
  const ext = ALLOWED_MIME_TYPES[mimeType];
  return `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
}

export function buildStoredUploadUrl(folder: UploadFolder, filename: string) {
  return `/api/uploads/${folder}/${filename}`;
}

export function parseStoredUploadUrl(url: string) {
  if (!url.startsWith("/api/uploads/")) return null;

  const parts = url.slice("/api/uploads/".length).split("/");
  if (parts.length !== 2) return null;

  const folder = normalizeUploadFolder(parts[0]);
  const filename = sanitizeStoredFilename(parts[1]);
  if (!filename) return null;

  return { folder, filename };
}

export function sanitizeStoredFilename(filename: string) {
  const base = path.basename(filename);
  if (!base || base.includes("..") || base.includes("/") || base.includes("\\")) {
    return null;
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(base)) return null;
  return base;
}

/** Lean Mongo queries return BSON Binary — convert to Node Buffer for HTTP responses. */
export function bufferFromStoredData(data: unknown): Buffer | null {
  if (!data) return null;
  if (Buffer.isBuffer(data)) return data;
  if (data instanceof Uint8Array) return Buffer.from(data);

  if (typeof data === "object" && data !== null) {
    const record = data as Record<string, unknown>;

    if (Buffer.isBuffer(record.buffer)) {
      return record.buffer as Buffer;
    }

    if (
      typeof record.read === "function" &&
      typeof record.length === "function"
    ) {
      const binary = data as { read: (pos: number, len: number) => Buffer; length: () => number };
      return binary.read(0, binary.length());
    }

    if (
      record.type === "Buffer" &&
      Array.isArray(record.data)
    ) {
      return Buffer.from(record.data as number[]);
    }
  }

  return null;
}

export function inferMimeTypeFromFilename(name: string): AllowedMimeType | null {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  return null;
}

export async function saveStoredUpload(
  buffer: Buffer,
  mimeType: AllowedMimeType,
  folderInput?: string | null,
) {
  await connectDB();

  const folder = normalizeUploadFolder(folderInput);
  const filename = generateStoredFilename(mimeType);

  await StoredUpload.create({
    folder,
    filename,
    mimeType,
    size: buffer.length,
    data: buffer,
  });

  const url = buildStoredUploadUrl(folder, filename);
  return { url, filename, size: buffer.length, folder, mimeType };
}

export async function getStoredUpload(folderInput: string, filenameInput: string) {
  await connectDB();

  const folder = normalizeUploadFolder(folderInput);
  const filename = sanitizeStoredFilename(filenameInput);
  if (!filename) return null;

  const doc = await StoredUpload.findOne({ folder, filename })
    .select("mimeType size data")
    .lean();

  if (!doc) return null;

  const data = bufferFromStoredData(doc.data);
  if (!data) return null;

  return {
    mimeType: doc.mimeType,
    size: data.length,
    data,
  };
}

export async function deleteStoredUploadByUrl(url: string) {
  const parsed = parseStoredUploadUrl(url);
  if (parsed) {
    await connectDB();
    await StoredUpload.deleteOne({
      folder: parsed.folder,
      filename: parsed.filename,
    });
    return;
  }

  if (url.startsWith("/uploads/")) {
    const relative = url.replace(/^\/uploads\//, "");
    const diskPath = path.join(LEGACY_UPLOADS_ROOT, relative);
    const resolved = path.resolve(diskPath);
    if (!resolved.startsWith(path.resolve(LEGACY_UPLOADS_ROOT))) return;

    try {
      await unlink(resolved);
    } catch {
      // ignore missing legacy file
    }
  }
}

export function extractImageUrls(
  images: Array<{ url?: string | null } | null | undefined> | undefined,
): string[] {
  return (images ?? [])
    .map((img) => img?.url)
    .filter((url): url is string => typeof url === "string" && url.length > 0);
}

export async function deleteRemovedStoredUploads(
  previousUrls: string[],
  nextUrls: string[],
) {
  const nextSet = new Set(nextUrls);
  await Promise.all(
    previousUrls
      .filter((url) => url.startsWith("/api/uploads/") && !nextSet.has(url))
      .map((url) => deleteStoredUploadByUrl(url)),
  );
}

export async function deleteStoredUploadsForImages(
  images: Array<{ url?: string | null } | null | undefined> | undefined,
) {
  await Promise.all(
    extractImageUrls(images)
      .filter((url) => url.startsWith("/api/uploads/"))
      .map((url) => deleteStoredUploadByUrl(url)),
  );
}
