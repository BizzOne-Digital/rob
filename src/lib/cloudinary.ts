import { v2 as cloudinary } from "cloudinary";

const configured =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

if (configured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export function isCloudinaryConfigured() {
  return configured;
}

export { cloudinary };

export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder?: string;
    filename?: string;
    resourceType?: "image" | "video" | "raw" | "auto";
  } = {},
) {
  if (!configured) {
    throw new Error("Cloudinary is not configured");
  }

  return new Promise<{
    url: string;
    publicId: string;
    width?: number;
    height?: number;
    bytes?: number;
    format?: string;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder ?? "rw-designs-canada",
        public_id: options.filename,
        resource_type: options.resourceType ?? "image",
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Upload failed"));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          format: result.format,
        });
      },
    );
    stream.end(buffer);
  });
}

export async function deleteFromCloudinary(publicId: string) {
  if (!configured) return;
  await cloudinary.uploader.destroy(publicId);
}
