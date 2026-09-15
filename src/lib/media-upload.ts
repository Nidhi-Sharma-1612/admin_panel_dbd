import { randomBytes } from "crypto";
import { db } from "@/db";
import { media } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { uploadFile } from "@/lib/storage";

export type ImageUploadResult = { url?: string; error?: string };

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export async function uploadSiteImage(params: {
  siteId: string;
  userId: string;
  file: File;
  altText?: string | null;
  keyPrefix?: string;
  allowVideo?: boolean;
}): Promise<ImageUploadResult> {
  const { siteId, userId, file, altText = null, keyPrefix = "", allowVideo = false } = params;

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file to upload." };
  }

  const isVideo = ALLOWED_VIDEO_TYPES.has(file.type);
  const isImage = ALLOWED_IMAGE_TYPES.has(file.type);

  if (!isImage && !(allowVideo && isVideo)) {
    return {
      error: allowVideo
        ? "Unsupported file type. Use JPEG, PNG, WebP, GIF, SVG, MP4, WebM, or MOV."
        : "Unsupported file type. Use JPEG, PNG, WebP, GIF, or SVG.",
    };
  }
  const maxSize = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
  if (file.size > maxSize) {
    return { error: `File is too large (max ${Math.round(maxSize / (1024 * 1024))}MB).` };
  }

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const key = `sites/${siteId}/${keyPrefix}${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;

  let url: string;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    url = await uploadFile({ key, body: buffer, contentType: file.type });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Upload failed." };
  }

  await db.insert(media).values({ siteId, url, altText });
  await logActivity({ siteId, userId, action: "uploaded", entity: "media" });

  return { url };
}
