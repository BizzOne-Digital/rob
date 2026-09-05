import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  const { connectDB } = await import("../src/lib/db");
  const { saveStoredUpload, getStoredUpload } = await import("../src/lib/stored-uploads");

  await connectDB();

  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );

  const saved = await saveStoredUpload(png, "image/png", "gallery");
  const doc = await getStoredUpload(saved.folder, saved.filename);

  console.log("url", saved.url);
  console.log("data type", doc?.data?.constructor?.name);
  console.log("isBuffer", Buffer.isBuffer(doc?.data));
  console.log("size", doc?.data?.length, "expected", png.length);
  console.log("png header", doc?.data?.subarray(0, 8).toString("hex"));

  await import("../src/lib/stored-uploads").then(({ deleteStoredUploadByUrl }) =>
    deleteStoredUploadByUrl(saved.url),
  );

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
