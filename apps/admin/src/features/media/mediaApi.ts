import { useAuthStore } from "@/stores/authStore";

export type MediaType = "IMAGE" | "VIDEO" | "PDF";

export type MediaAsset = {
  id: number;
  fileName: string;
  mediaType: MediaType;
  mimeType: string;
  sizeBytes: number;
  objectKey: string;
  publicUrl: string | null;
  thumbnailUrl: string | null;
  altText: string | null;
  metadata: Record<string, unknown>;
  uploadedBy: number | null;
  createdAt: string;
};

export type MediaListParams = {
  mediaType?: MediaType | "ALL";
  keyword?: string;
  uploadedBy?: number | null;
  page?: number;
  pageSize?: number;
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  requestId?: string;
};

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_BASE_URL ?? "";

export class MediaApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "MediaApiError";
    this.code = code;
  }
}

export async function listMedia(params: MediaListParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.mediaType && params.mediaType !== "ALL") {
    searchParams.set("mediaType", params.mediaType);
  }
  if (params.keyword?.trim()) {
    searchParams.set("keyword", params.keyword.trim());
  }
  if (params.uploadedBy !== null && params.uploadedBy !== undefined) {
    searchParams.set("uploadedBy", String(params.uploadedBy));
  }
  if (params.page) {
    searchParams.set("page", String(params.page));
  }
  if (params.pageSize) {
    searchParams.set("pageSize", String(params.pageSize));
  }

  const query = searchParams.toString();
  return request<PageResponse<MediaAsset>>(`/api/admin/media${query ? `?${query}` : ""}`);
}

export async function uploadMedia(file: File, mediaType?: MediaType) {
  const formData = new FormData();
  formData.set("file", file);
  if (mediaType) {
    formData.set("mediaType", mediaType);
  }

  return request<MediaAsset>("/api/admin/media/upload", {
    method: "POST",
    body: formData
  });
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { token, tokenType } = useAuthStore.getState();
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `${tokenType} ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers
  });
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new MediaApiError(
      payload.error?.code ?? "MEDIA_API_FAILED",
      payload.error?.message ?? "Unable to load media data"
    );
  }

  return payload.data;
}
