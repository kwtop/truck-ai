export type LoginUser = {
  id: number;
  username: string;
  displayName: string;
};

export type LoginResponse = {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: LoginUser;
  permissions: string[];
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

export type LoginRequest = {
  username: string;
  password: string;
};

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_BASE_URL ?? "";

export class AuthApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AuthApiError";
    this.code = code;
  }
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/admin/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  const payload = (await response.json()) as ApiResponse<LoginResponse>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new AuthApiError(
      payload.error?.code ?? "AUTH_LOGIN_FAILED",
      payload.error?.message ?? "Unable to sign in"
    );
  }

  return payload.data;
}
