import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/stores/authStore";
import { MediaApiError, listMedia, uploadMedia } from "./mediaApi";

describe("mediaApi", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    useAuthStore.setState({
      token: "jwt-token",
      tokenType: "Bearer",
      permissions: ["media:read", "media:write"],
      isAuthenticated: true
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    useAuthStore.getState().logout();
  });

  it("loads media with filters and authorization", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: {
          items: [mediaData(1)],
          page: 2,
          pageSize: 12,
          total: 25
        }
      })
    );

    const page = await listMedia({
      mediaType: "IMAGE",
      keyword: "tow",
      uploadedBy: 7,
      page: 2,
      pageSize: 12
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/admin/media?mediaType=IMAGE&keyword=tow&uploadedBy=7&page=2&pageSize=12",
      expect.objectContaining({})
    );
    const listInit = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit;
    const listHeaders = listInit.headers as Headers;
    expect(listHeaders.get("Authorization")).toBe("Bearer jwt-token");
    expect(listHeaders.get("Content-Type")).toBe("application/json");
    expect(page.items[0].fileName).toBe("tow-truck.jpg");
  });

  it("uploads media with multipart form data", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ success: true, data: mediaData(2) }));
    const file = new File(["data"], "tow-truck.jpg", { type: "image/jpeg" });

    const media = await uploadMedia(file, "IMAGE");

    expect(media.id).toBe(2);
    expect(fetch).toHaveBeenCalledWith(
      "/api/admin/media/upload",
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData)
      })
    );
    const init = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit;
    const headers = init.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer jwt-token");
    expect(headers.has("Content-Type")).toBe(false);
  });

  it("throws normalized backend errors", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: {
            code: "MEDIA_STORAGE_FAILED",
            message: "Unable to upload object"
          }
        },
        500
      )
    );

    await expect(uploadMedia(new File(["data"], "tow-truck.jpg"), "IMAGE")).rejects.toMatchObject({
      code: "MEDIA_STORAGE_FAILED",
      message: "Unable to upload object"
    } satisfies Partial<MediaApiError>);
  });
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function mediaData(id: number) {
  return {
    id,
    fileName: "tow-truck.jpg",
    mediaType: "IMAGE" as const,
    mimeType: "image/jpeg",
    sizeBytes: 2048,
    objectKey: "media/2026/05/09/tow-truck.jpg",
    publicUrl: "https://cdn.example.com/media/2026/05/09/tow-truck.jpg",
    thumbnailUrl: null,
    altText: null,
    metadata: { originalFileName: "tow-truck.jpg" },
    uploadedBy: 7,
    createdAt: "2026-05-09T00:00:00Z"
  };
}
