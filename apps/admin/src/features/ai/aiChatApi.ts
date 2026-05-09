import { useAuthStore } from "@/stores/authStore";

export type AiChatSessionSummary = {
  id: number;
  sessionNo: string;
  visitorId: string | null;
  locale: string;
  sourcePage: string | null;
  leadId: number | null;
  leadNo: string | null;
  leadName: string | null;
  leadCountry: string | null;
  status: string;
  messageCount: number;
  createdAt: string;
  lastMessageAt: string | null;
};

export type AiChatMessage = {
  id: number;
  sessionId: number;
  role: "USER" | "ASSISTANT" | "SYSTEM" | string;
  content: string;
  toolName: string | null;
  toolPayload: Record<string, unknown>;
  tokenUsage: Record<string, unknown>;
  createdAt: string;
};

export type AiChatSessionDetail = {
  session: AiChatSessionSummary;
  messages: AiChatMessage[];
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type ChatSessionListParams = {
  keyword?: string;
  locale?: string;
  hasLead?: boolean | null;
  page?: number;
  pageSize?: number;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
};

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_BASE_URL ?? "";

export class AiChatApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AiChatApiError";
    this.code = code;
  }
}

export async function listAiChatSessions(params: ChatSessionListParams = {}) {
  const searchParams = chatSessionSearchParams(params);
  const query = searchParams.toString();
  return request<PageResponse<AiChatSessionSummary>>(`/api/admin/ai/chat-sessions${query ? `?${query}` : ""}`);
}

export async function getAiChatSession(id: number) {
  return request<AiChatSessionDetail>(`/api/admin/ai/chat-sessions/${id}`);
}

export function chatSessionSearchParams(params: ChatSessionListParams) {
  const searchParams = new URLSearchParams();
  if (params.keyword?.trim()) {
    searchParams.set("keyword", params.keyword.trim());
  }
  if (params.locale?.trim()) {
    searchParams.set("locale", params.locale.trim());
  }
  if (params.hasLead !== null && params.hasLead !== undefined) {
    searchParams.set("hasLead", String(params.hasLead));
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
    throw new AiChatApiError(
      payload.error?.code ?? "AI_CHAT_API_FAILED",
      payload.error?.message ?? "Unable to load AI chat sessions"
    );
  }

  return payload.data;
}
