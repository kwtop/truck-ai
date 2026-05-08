import { useAuthStore } from "@/stores/authStore";

export type AttributeStatus = "ACTIVE" | "DISABLED";
export type AttributeDataType = "number" | "text" | "select" | "multi_select" | "boolean" | "range";

export type VehicleAttributeDefinition = {
  id: number;
  categoryId: number;
  code: string;
  defaultLabel: string;
  dataType: AttributeDataType;
  unit: string | null;
  options: string | null;
  validationRules: string | null;
  uiConfig: string | null;
  required: boolean;
  filterable: boolean;
  comparable: boolean;
  sortOrder: number;
  status: AttributeStatus;
};

export type AttributePayload = {
  categoryId: number;
  code: string;
  defaultLabel: string;
  dataType: AttributeDataType;
  unit: string;
  options: unknown[];
  validationRules: Record<string, unknown>;
  uiConfig: Record<string, unknown>;
  required: boolean;
  filterable: boolean;
  comparable: boolean;
  sortOrder: number;
  status: AttributeStatus;
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

export class AttributeApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AttributeApiError";
    this.code = code;
  }
}

export async function listAttributes(categoryId: number) {
  return request<VehicleAttributeDefinition[]>(`/api/admin/attributes?categoryId=${categoryId}`);
}

export async function createAttribute(payload: AttributePayload) {
  return request<VehicleAttributeDefinition>("/api/admin/attributes", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateAttribute(id: number, payload: AttributePayload) {
  return request<VehicleAttributeDefinition>(`/api/admin/attributes/${id}`, {
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
    throw new AttributeApiError(
      payload.error?.code ?? "ATTRIBUTE_API_FAILED",
      payload.error?.message ?? "Unable to load attribute data"
    );
  }

  return payload.data;
}
