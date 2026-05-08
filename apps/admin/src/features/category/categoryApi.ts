import { useAuthStore } from "@/stores/authStore";

export type CategoryStatus = "ACTIVE" | "DISABLED";

export type VehicleCategory = {
  id: number;
  parentId: number | null;
  code: string;
  slug: string;
  defaultName: string;
  defaultDescription: string | null;
  status: CategoryStatus;
  sortOrder: number;
  seoConfig: string | null;
  displayConfig: string | null;
  children: VehicleCategory[];
};

export type CategoryPayload = {
  parentId: number | null;
  code: string;
  slug: string;
  defaultName: string;
  defaultDescription: string;
  status: CategoryStatus;
  sortOrder: number;
  seoConfig: string;
  displayConfig: string;
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

export type CategoryListParams = {
  keyword?: string;
  status?: CategoryStatus | "ALL";
};

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_BASE_URL ?? "";

export class CategoryApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "CategoryApiError";
    this.code = code;
  }
}

export async function listCategories(params: CategoryListParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.keyword?.trim()) {
    searchParams.set("keyword", params.keyword.trim());
  }
  if (params.status && params.status !== "ALL") {
    searchParams.set("status", params.status);
  }

  const query = searchParams.toString();
  return request<VehicleCategory[]>(`/api/admin/categories${query ? `?${query}` : ""}`);
}

export async function createCategory(payload: CategoryPayload) {
  return request<VehicleCategory>("/api/admin/categories", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateCategory(id: number, payload: CategoryPayload) {
  return request<VehicleCategory>(`/api/admin/categories/${id}`, {
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
    throw new CategoryApiError(
      payload.error?.code ?? "CATEGORY_API_FAILED",
      payload.error?.message ?? "Unable to load category data"
    );
  }

  return payload.data;
}
