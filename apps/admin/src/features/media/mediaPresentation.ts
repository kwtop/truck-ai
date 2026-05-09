import type { MediaAsset, MediaType } from "./mediaApi";

export function inferMediaType(file: File): MediaType | undefined {
  const mimeType = file.type.toLowerCase();
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (mimeType.startsWith("image/") || ["jpg", "jpeg", "png", "webp"].includes(extension ?? "")) {
    return "IMAGE";
  }
  if (mimeType.startsWith("video/") || ["mp4", "webm"].includes(extension ?? "")) {
    return "VIDEO";
  }
  if (mimeType === "application/pdf" || extension === "pdf") {
    return "PDF";
  }
  return undefined;
}

export function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }
  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }
  return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
}

export function previewUrl(media: MediaAsset) {
  return media.publicUrl ?? media.thumbnailUrl ?? "";
}
