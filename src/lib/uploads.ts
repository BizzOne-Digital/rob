import {
  ALLOWED_MIME_TYPES,
  deleteStoredUploadByUrl,
  isAllowedMimeType,
  normalizeUploadFolder,
  saveStoredUpload,
  type AllowedMimeType,
} from "@/lib/stored-uploads";

function mapLegacyFolder(folder?: string) {
  if (!folder || folder === "general") return "misc";
  return normalizeUploadFolder(folder);
}

function inferMimeType(originalName: string, mimeType?: string): AllowedMimeType | null {
  if (mimeType && isAllowedMimeType(mimeType)) return mimeType;

  const ext = originalName.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  return null;
}

export async function saveUploadFile(
  buffer: Buffer,
  originalName: string,
  options?: { folder?: string; mimeType?: string },
) {
  const folder = mapLegacyFolder(options?.folder);
  const mimeType = inferMimeType(originalName, options?.mimeType);
  if (!mimeType) {
    throw new Error("Unsupported file type");
  }

  const saved = await saveStoredUpload(buffer, mimeType, folder);
  return {
    url: saved.url,
    filename: originalName,
    format: ALLOWED_MIME_TYPES[mimeType],
    bytes: saved.size,
  };
}

export async function deleteUploadFile(url: string) {
  await deleteStoredUploadByUrl(url);
}
