import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = new Map<string, string>();

function installLocalStorage() {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
      clear: () => storage.clear()
    }
  });
}

describe("authStore", () => {
  beforeEach(() => {
    storage.clear();
    installLocalStorage();
    vi.resetModules();
  });

  it("persists login session and clears it on logout", async () => {
    const { useAuthStore } = await import("./authStore");

    useAuthStore.getState().setLoginSession({
      token: "jwt-token",
      tokenType: "Bearer",
      expiresIn: 7200,
      user: { id: 1, username: "admin", displayName: "Admin" },
      permissions: ["dashboard:read"]
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().token).toBe("jwt-token");
    expect(useAuthStore.getState().permissions).toEqual(["dashboard:read"]);
    expect(window.localStorage.getItem("b2btruck.admin.auth")).toContain("jwt-token");

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(window.localStorage.getItem("b2btruck.admin.auth")).toBeNull();
  });
});
