import { useAuthStore } from "@/stores/authStore";

export type ProductStatus = "DRAFT" | "PUBLISHED" | "OFFLINE";

export type Product = {
  id: number;
  categoryId: number;
  sku: string | null;
  slug: string;
  defaultName: string;
  defaultSummary: string | null;
  status: ProductStatus;
  specs: Record<string, unknown>;
  seoConfig: Record<string, unknown>;
  shippingConfig: Record<string, unknown>;
  aiEnabled: boolean;
  featured: boolean;
  sortOrder: number;
  publishedAt: string | null;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductPayload = {
  categoryId: number;
  sku: string;
  slug: string;
  defaultName: string;
  defaultSummary: string;
  status: ProductStatus;
  specs: Record<string, unknown>;
  seoConfig: Record<string, unknown>;
  shippingConfig: Record<string, unknown>;
  aiEnabled: boolean;
  featured: boolean;
  sortOrder: number;
};

export type ProductListParams = {
  categoryId?: number | null;
  keyword?: string;
  status?: ProductStatus | "ALL";
};

export type ProductTranslation = {
  id: number | null;
  productId: number;
  locale: string;
  name: string;
  summary: string | null;
  description: string | null;
  applications: string | null;
  localizedSpecs: Record<string, unknown>;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  fallback: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ProductTranslationPayload = {
  name: string;
  summary: string;
  description: string;
  applications: string;
  localizedSpecs: Record<string, unknown>;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
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

export class ProductApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ProductApiError";
    this.code = code;
  }
}

export async function listProducts(params: ProductListParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.categoryId !== null && params.categoryId !== undefined) {
    searchParams.set("categoryId", String(params.categoryId));
  }
  if (params.keyword?.trim()) {
    searchParams.set("keyword", params.keyword.trim());
  }
  if (params.status && params.status !== "ALL") {
    searchParams.set("status", params.status);
  }

  const query = searchParams.toString();
  return request<Product[]>(`/api/admin/products${query ? `?${query}` : ""}`);
}

export async function createProduct(payload: ProductPayload) {
  return request<Product>("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateProduct(id: number, payload: ProductPayload) {
  return request<Product>(`/api/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteProduct(id: number) {
  return request<void>(`/api/admin/products/${id}`, {
    method: "DELETE"
  });
}

export async function getProductTranslation(productId: number, locale: string) {
  return request<ProductTranslation>(
    `/api/admin/products/${productId}/translations/${encodeURIComponent(locale)}`
  );
}

export async function upsertProductTranslation(
  productId: number,
  locale: string,
  payload: ProductTranslationPayload
) {
  return request<ProductTranslation>(
    `/api/admin/products/${productId}/translations/${encodeURIComponent(locale)}`,
    {
      method: "PUT",
      body: JSON.stringify(payload)
    }
  );
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

  if (!response.ok || !payload.success || (payload.data === undefined && response.status !== 200)) {
    throw new ProductApiError(
      payload.error?.code ?? "PRODUCT_API_FAILED",
      payload.error?.message ?? "Unable to load product data"
    );
  }

  return payload.data as T;
}
