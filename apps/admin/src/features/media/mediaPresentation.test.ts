import { describe, expect, it } from "vitest";
import { formatFileSize, inferMediaType, previewUrl } from "./mediaPresentation";
import type { MediaAsset } from "./mediaApi";

describe("mediaPresentation", () => {
  it("infers media type from mime type and extension", () => {
    expect(inferMediaType(new File(["x"], "truck.jpg", { type: "image/jpeg" }))).toBe("IMAGE");
    expect(inferMediaType(new File(["x"], "clip.webm", { type: "video/webm" }))).toBe("VIDEO");
    expect(inferMediaType(new File(["x"], "brochure.pdf", { type: "application/pdf" }))).toBe("PDF");
    expect(inferMediaType(new File(["x"], "archive.zip", { type: "application/zip" }))).toBeUndefined();
  });

  it("formats file sizes", () => {
    expect(formatFileSize(900)).toBe("900 B");
    expect(formatFileSize(2048)).toBe("2.0 KB");
    expect(formatFileSize(3 * 1024 * 1024)).toBe("3.0 MB");
  });

  it("prefers public url for previews", () => {
    expect(previewUrl(media({ publicUrl: "https://cdn.example.com/file.jpg" }))).toBe("https://cdn.example.com/file.jpg");
    expect(previewUrl(media({ publicUrl: null, thumbnailUrl: "https://cdn.example.com/thumb.jpg" }))).toBe("https://cdn.example.com/thumb.jpg");
  });
});

function media(overrides: Partial<MediaAsset>): MediaAsset {
  return {
    id: 1,
    fileName: "truck.jpg",
    mediaType: "IMAGE",
    mimeType: "image/jpeg",
    sizeBytes: 2048,
    objectKey: "media/truck.jpg",
    publicUrl: null,
    thumbnailUrl: null,
    altText: null,
    metadata: {},
    uploadedBy: 1,
    createdAt: "2026-05-09T00:00:00Z",
    ...overrides
  };
}
