import { describe, expect, it } from "vitest";
import { canAccessPath, hasPermission, visibleMenuItems } from "./menu";

describe("permission menu", () => {
  it("filters menu items by permission", () => {
    expect(visibleMenuItems(["dashboard:read", "lead:read"]).map((item) => item.path)).toEqual([
      "/dashboard",
      "/leads"
    ]);
  });

  it("checks individual permissions", () => {
    expect(hasPermission(["product:read"], "product:read")).toBe(true);
    expect(hasPermission(["product:read"], "lead:read")).toBe(false);
    expect(hasPermission([], null)).toBe(true);
  });

  it("guards known menu paths and allows unknown paths to be handled elsewhere", () => {
    expect(canAccessPath("/products", ["product:read"])).toBe(true);
    expect(canAccessPath("/products", ["dashboard:read"])).toBe(false);
    expect(canAccessPath("/unknown", [])).toBe(true);
  });
});
