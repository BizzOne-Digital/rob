import { randomUUID } from "crypto";
import path from "path";
import { mkdir, unlink, writeFile } from "fs/promises";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

function sanitizeFolder(folder?: string) {
  const cleaned = (folder || "general")
    .replace(/\\/g, "/")
    .split("/")
    .map((part) => part.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40))
    .filter(Boolean)
    .join("/");
  return cleaned || "general";
}

function sanitizeBaseName(name: string) {
  return name.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || "file";
}

export async function saveUploadFile(
  buffer: Buffer,
  originalName: string,
  options?: { folder?: string },
) {
  const folder = sanitizeFolder(options?.folder);
  const ext = path.extname(originalName) || "";
  const base = sanitizeBaseName(path.basename(originalName, ext));
  const filename = `${base}-${randomUUID()}${ext.toLowerCase()}`;
  const dir = path.join(UPLOADS_ROOT, folder);
  await mkdir(dir, { recursive: true });
  const diskPath = path.join(dir, filename);
  await writeFile(diskPath, buffer);

  const urlPath = `/uploads/${folder}/${filename}`.replace(/\\/g, "/");
  return {
    url: urlPath,
    filename: originalName,
    diskPath,
    format: ext.replace(".", "").toLowerCase() || undefined,
    bytes: buffer.length,
  };
}

export async function deleteUploadFile(url: string) {
  if (!url.startsWith("/uploads/")) return;

  const relative = url.replace(/^\/uploads\//, "");
  const diskPath = path.join(UPLOADS_ROOT, relative);
  const resolved = path.resolve(diskPath);
  if (!resolved.startsWith(path.resolve(UPLOADS_ROOT))) return;

  try {
    await unlink(resolved);
  } catch {
    // ignore missing local file
  }
}
