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

  return StoredUpload.findOne({ folder, filename }).lean();
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
