import { describe, expect, it } from "vitest";

import { resolveAdminLayoutRedirect } from "./AdminLayout";

describe("AdminLayout permission guard", () => {
  it("redirects unauthenticated visitors to login", () => {
    expect(
      resolveAdminLayoutRedirect({
        pathname: "/products",
        isAuthenticated: false,
        hasUser: false,
        permissions: []
      })
    ).toBe("/login");
  });

  it("redirects authenticated users without route permission to dashboard", () => {
    expect(
      resolveAdminLayoutRedirect({
        pathname: "/products",
        isAuthenticated: true,
        hasUser: true,
        permissions: ["dashboard:read"]
      })
    ).toBe("/dashboard");
  });

  it("allows authenticated users with permission and unknown routes handled by router", () => {
    expect(
      resolveAdminLayoutRedirect({
        pathname: "/products",
        isAuthenticated: true,
        hasUser: true,
        permissions: ["product:read"]
      })
    ).toBeNull();
    expect(
      resolveAdminLayoutRedirect({
        pathname: "/unknown",
        isAuthenticated: true,
        hasUser: true,
        permissions: []
      })
    ).toBeNull();
  });
});
