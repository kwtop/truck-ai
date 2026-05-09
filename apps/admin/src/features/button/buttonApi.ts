import { useAuthStore } from "@/stores/authStore";

export type ButtonActionType = "RFQ" | "WHATSAPP" | "DOWNLOAD" | "AI_CHAT" | "LINK";
export type ButtonStatus = "ACTIVE" | "INACTIVE";

export type SiteButtonConfig = {
  id: number;
  buttonKey: string;
  placement: string;
  locale: string;
  text: string;
  actionType: ButtonActionType;
  actionConfig: Record<string, unknown>;
  styleConfig: Record<string, unknown>;
  status: ButtonStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type SiteButtonConfigPayload = {
  buttonKey: string;
  placement: string;
  locale: string;
  text: string;
  actionType: ButtonActionType;
  actionConfig: Record<string, unknown>;
  styleConfig: Record<string, unknown>;
  status: ButtonStatus;
  sortOrder: number;
};

export type ButtonListParams = {
  placement?: string;
  locale?: string;
  status?: ButtonStatus | "ALL";
  actionType?: ButtonActionType | "ALL";
  keyword?: string;
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

export class ButtonApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ButtonApiError";
    this.code = code;
  }
}

export async function listButtons(params: ButtonListParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.placement?.trim()) {
    searchParams.set("placement", params.placement.trim());
  }
  if (params.locale?.trim()) {
    searchParams.set("locale", params.locale.trim());
  }
  if (params.status && params.status !== "ALL") {
    searchParams.set("status", params.status);
  }
  if (params.actionType && params.actionType !== "ALL") {
    searchParams.set("actionType", params.actionType);
  }
  if (params.keyword?.trim()) {
    searchParams.set("keyword", params.keyword.trim());
  }

  const query = searchParams.toString();
  return request<SiteButtonConfig[]>(`/api/admin/buttons${query ? `?${query}` : ""}`);
}

export async function createButton(payload: SiteButtonConfigPayload) {
  return request<SiteButtonConfig>("/api/admin/buttons", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateButton(id: number, payload: SiteButtonConfigPayload) {
  return request<SiteButtonConfig>(`/api/admin/buttons/${id}`, {
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
    throw new ButtonApiError(
      payload.error?.code ?? "BUTTON_API_FAILED",
      payload.error?.message ?? "Unable to load button data"
    );
  }

  return payload.data;
}
