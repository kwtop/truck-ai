import { create } from "zustand";
import type { LoginResponse, LoginUser } from "@/features/auth/authApi";

const STORAGE_KEY = "b2btruck.admin.auth";

type StoredAuth = {
  token: string;
  tokenType: string;
  expiresAt: number;
  user: LoginUser;
  permissions: string[];
};

type AuthState = {
  token: string | null;
  tokenType: string;
  expiresAt: number | null;
  user: LoginUser | null;
  permissions: string[];
  isAuthenticated: boolean;
  setLoginSession: (response: LoginResponse) => void;
  logout: () => void;
};

function readStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined" || !isStorageAvailable()) {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed.token || !parsed.user || Date.now() >= parsed.expiresAt) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function persistAuth(auth: StoredAuth) {
  if (!isStorageAvailable()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

function clearStoredAuth() {
  if (!isStorageAvailable()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

function isStorageAvailable() {
  return (
    typeof window.localStorage?.getItem === "function" &&
    typeof window.localStorage?.setItem === "function" &&
    typeof window.localStorage?.removeItem === "function"
  );
}

const storedAuth = readStoredAuth();

export const useAuthStore = create<AuthState>((set) => ({
  token: storedAuth?.token ?? null,
  tokenType: storedAuth?.tokenType ?? "Bearer",
  expiresAt: storedAuth?.expiresAt ?? null,
  user: storedAuth?.user ?? null,
  permissions: storedAuth?.permissions ?? [],
  isAuthenticated: Boolean(storedAuth),
  setLoginSession: (response) => {
    const auth: StoredAuth = {
      token: response.token,
      tokenType: response.tokenType,
      expiresAt: Date.now() + response.expiresIn * 1000,
      user: response.user,
      permissions: response.permissions
    };

    persistAuth(auth);
    set({
      ...auth,
      isAuthenticated: true
    });
  },
  logout: () => {
    clearStoredAuth();
    set({
      token: null,
      tokenType: "Bearer",
      expiresAt: null,
      user: null,
      permissions: [],
      isAuthenticated: false
    });
  }
}));
