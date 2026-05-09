import { useAuthStore } from "@/stores/authStore";

export type SitePageStatus = "DRAFT" | "PUBLISHED" | "OFFLINE";
export type SitePageType = "HOME" | "CATEGORY" | "MARKET" | "SOLUTION" | "CUSTOM" | "LANDING";

export type SitePage = {
  id: number;
  pageType: SitePageType;
  slug: string;
  locale: string;
  title: string;
  status: SitePageStatus;
  seoConfig: Record<string, unknown>;
  pageConfig: Record<string, unknown>;
  publishedAt: string | null;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: string;
  updatedAt: string;
};

export type SitePagePayload = {
  pageType: SitePageType;
  slug: string;
  locale: string;
  title: string;
  status: SitePageStatus;
  seoConfig: Record<string, unknown>;
  pageConfig: Record<string, unknown>;
};

export type SitePageBlock = {
  id: number;
  pageId: number;
  blockKey: string;
  blockType: SitePageBlockType;
  locale: string;
  visible: boolean;
  sortOrder: number;
  contentConfig: Record<string, unknown>;
  styleConfig: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type SitePageBlockType =
  | "HERO_BANNER"
  | "RICH_TEXT"
  | "FEATURED_PRODUCTS"
  | "CATEGORY_GRID"
  | "MEDIA_GALLERY"
  | "FAQ"
  | "CTA"
  | "CUSTOM";

export type SitePageBlockPayload = {
  pageId: number;
  blockKey: string;
  blockType: SitePageBlockType;
  locale: string;
  visible: boolean;
  sortOrder: number;
  contentConfig: Record<string, unknown>;
  styleConfig: Record<string, unknown>;
};

export type SitePageListParams = {
  pageType?: SitePageType | "ALL";
  locale?: string;
  status?: SitePageStatus | "ALL";
  keyword?: string;
};

export type SitePageBlockListParams = {
  pageId?: number | null;
  locale?: string;
  visible?: boolean | "ALL";
  blockType?: SitePageBlockType | "ALL";
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

export class PageApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "PageApiError";
    this.code = code;
  }
}

export async function listPages(params: SitePageListParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.pageType && params.pageType !== "ALL") {
    searchParams.set("pageType", params.pageType);
  }
  if (params.locale?.trim()) {
    searchParams.set("locale", params.locale.trim());
  }
  if (params.status && params.status !== "ALL") {
    searchParams.set("status", params.status);
  }
  if (params.keyword?.trim()) {
    searchParams.set("keyword", params.keyword.trim());
  }

  const query = searchParams.toString();
  return request<SitePage[]>(`/api/admin/pages${query ? `?${query}` : ""}`);
}

export async function createPage(payload: SitePagePayload) {
  return request<SitePage>("/api/admin/pages", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updatePage(id: number, payload: SitePagePayload) {
  return request<SitePage>(`/api/admin/pages/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function listPageBlocks(params: SitePageBlockListParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.pageId !== null && params.pageId !== undefined) {
    searchParams.set("pageId", String(params.pageId));
  }
  if (params.locale?.trim()) {
    searchParams.set("locale", params.locale.trim());
  }
  if (params.visible !== undefined && params.visible !== "ALL") {
    searchParams.set("visible", String(params.visible));
  }
  if (params.blockType && params.blockType !== "ALL") {
    searchParams.set("blockType", params.blockType);
  }

  const query = searchParams.toString();
  return request<SitePageBlock[]>(`/api/admin/page-blocks${query ? `?${query}` : ""}`);
}

export async function createPageBlock(payload: SitePageBlockPayload) {
  return request<SitePageBlock>("/api/admin/page-blocks", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updatePageBlock(id: number, payload: SitePageBlockPayload) {
  return request<SitePageBlock>(`/api/admin/page-blocks/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { token, tokenType } = useAuthStore.getState();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `${tokenType} ${token}` } : {}),
      ...init.headers
    }
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new PageApiError(
      payload.error?.code ?? "PAGE_API_FAILED",
      payload.error?.message ?? "Unable to load page data"
    );
  }

  return payload.data;
}
