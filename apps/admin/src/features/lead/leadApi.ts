import { useAuthStore } from "@/stores/authStore";

export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "QUOTED" | "WON" | "LOST";
export type FollowType = "EMAIL" | "PHONE" | "WHATSAPP" | "QUOTE" | "NOTE";

export type AdminLead = {
  id: number;
  leadNo: string;
  name: string;
  companyName: string | null;
  country: string | null;
  email: string | null;
  whatsapp: string | null;
  interestedProductId: number | null;
  interestedProductSlug: string | null;
  interestedProductName: string | null;
  vehicleType: string | null;
  quantity: number | null;
  message: string | null;
  status: LeadStatus;
  assignedTo: number | null;
  quoted: boolean;
  won: boolean;
  requirementDetails: Record<string, unknown>;
  sourceContext: Record<string, unknown>;
  aiSummary: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LeadFollowUp = {
  id: number;
  leadId: number;
  followType: FollowType;
  content: string;
  nextActionAt: string | null;
  attachments: Array<Record<string, unknown>>;
  createdBy: number | null;
  createdAt: string;
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type LeadListParams = {
  status?: LeadStatus | "ALL";
  country?: string;
  assignedTo?: number | null;
  dateFrom?: string;
  dateTo?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
};

export type FollowUpPayload = {
  followType: FollowType;
  content: string;
  nextActionAt?: string | null;
  attachments?: Array<Record<string, unknown>>;
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

export class LeadApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "LeadApiError";
    this.code = code;
  }
}

export async function listLeads(params: LeadListParams = {}) {
  const searchParams = leadSearchParams(params);
  const query = searchParams.toString();
  return request<PageResponse<AdminLead>>(`/api/admin/leads${query ? `?${query}` : ""}`);
}

export async function getLead(id: number) {
  return request<AdminLead>(`/api/admin/leads/${id}`);
}

export async function assignLead(id: number, assignedTo: number) {
  return request<AdminLead>(`/api/admin/leads/${id}/assign`, {
    method: "PUT",
    body: JSON.stringify({ assignedTo })
  });
}

export async function updateLeadStatus(id: number, status: LeadStatus, flags: { quoted?: boolean; won?: boolean } = {}) {
  return request<AdminLead>(`/api/admin/leads/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status, ...flags })
  });
}

export async function listLeadFollowUps(id: number) {
  return request<PageResponse<LeadFollowUp>>(`/api/admin/leads/${id}/follow-ups`);
}

export async function addLeadFollowUp(id: number, payload: FollowUpPayload) {
  return request<LeadFollowUp>(`/api/admin/leads/${id}/follow-ups`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function exportLeads(params: LeadListParams = {}) {
  const searchParams = leadSearchParams(params);
  const query = searchParams.toString();
  return requestBlob(`/api/admin/leads/export${query ? `?${query}` : ""}`);
}

function leadSearchParams(params: LeadListParams) {
  const searchParams = new URLSearchParams();
  if (params.status && params.status !== "ALL") {
    searchParams.set("status", params.status);
  }
  if (params.country?.trim()) {
    searchParams.set("country", params.country.trim());
  }
  if (params.assignedTo !== null && params.assignedTo !== undefined) {
    searchParams.set("assignedTo", String(params.assignedTo));
  }
  if (params.dateFrom?.trim()) {
    searchParams.set("dateFrom", params.dateFrom.trim());
  }
  if (params.dateTo?.trim()) {
    searchParams.set("dateTo", params.dateTo.trim());
  }
  if (params.keyword?.trim()) {
    searchParams.set("keyword", params.keyword.trim());
  }
  if (params.page) {
    searchParams.set("page", String(params.page));
  }
  if (params.pageSize) {
    searchParams.set("pageSize", String(params.pageSize));
  }
  return searchParams;
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
    throw new LeadApiError(
      payload.error?.code ?? "LEAD_API_FAILED",
      payload.error?.message ?? "Unable to load lead data"
    );
  }

  return payload.data;
}

async function requestBlob(path: string): Promise<Blob> {
  const { token, tokenType } = useAuthStore.getState();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...(token ? { Authorization: `${tokenType} ${token}` } : {})
    }
  });

  if (!response.ok) {
    throw new LeadApiError("LEAD_EXPORT_FAILED", "Unable to export leads");
  }

  return response.blob();
}
