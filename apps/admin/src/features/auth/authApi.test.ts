import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthApiError, login } from "./authApi";

describe("authApi", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts credentials and returns login data", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            token: "jwt-token",
            tokenType: "Bearer",
            expiresIn: 7200,
            user: { id: 1, username: "admin", displayName: "Admin" },
            permissions: ["dashboard:read"]
          }
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const response = await login({ username: "admin", password: "CorrectPassword1!" });

    expect(fetch).toHaveBeenCalledWith(
      "/api/admin/auth/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ username: "admin", password: "CorrectPassword1!" })
      })
    );
    expect(response.token).toBe("jwt-token");
    expect(response.permissions).toEqual(["dashboard:read"]);
  });

  it("throws backend error messages", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: false,
          error: {
            code: "AUTH_INVALID_CREDENTIALS",
            message: "Invalid username or password"
          }
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    );

    await expect(login({ username: "admin", password: "wrong" })).rejects.toMatchObject({
      code: "AUTH_INVALID_CREDENTIALS",
      message: "Invalid username or password"
    } satisfies Partial<AuthApiError>);
  });
});
