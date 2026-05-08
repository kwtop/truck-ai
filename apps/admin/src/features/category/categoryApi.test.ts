import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CategoryApiError,
  createCategory,
  listCategories,
  updateCategory
} from "./categoryApi";
import { useAuthStore } from "@/stores/authStore";

describe("categoryApi", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    useAuthStore.setState({
      token: "jwt-token",
      tokenType: "Bearer",
      permissions: ["category:read", "category:write"],
      isAuthenticated: true
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    useAuthStore.getState().logout();
  });

  it("loads category tree with authorization and filters", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: [
          {
            id: 1,
            parentId: null,
            code: "TRUCKS",
            slug: "trucks",
            defaultName: "Trucks",
            defaultDescription: "",
            status: "ACTIVE",
            sortOrder: 10,
            seoConfig: "{}",
            displayConfig: "{}",
            children: []
          }
        ]
      })
    );

    const categories = await listCategories({ keyword: "truck", status: "ACTIVE" });

    expect(fetch).toHaveBeenCalledWith(
      "/api/admin/categories?keyword=truck&status=ACTIVE",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-token"
        })
      })
    );
    expect(categories[0].code).toBe("TRUCKS");
  });

  it("posts create payloads", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ success: true, data: categoryData(1) }));

    await createCategory(categoryPayload());

    expect(fetch).toHaveBeenCalledWith(
      "/api/admin/categories",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(categoryPayload()),
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer jwt-token"
        })
      })
    );
  });

  it("puts update payloads", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ success: true, data: categoryData(2) }));

    await updateCategory(2, categoryPayload());

    expect(fetch).toHaveBeenCalledWith(
      "/api/admin/categories/2",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify(categoryPayload())
      })
    );
  });

  it("throws normalized backend errors", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Slug already exists"
          }
        },
        400
      )
    );

    await expect(createCategory(categoryPayload())).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "Slug already exists"
    } satisfies Partial<CategoryApiError>);
  });
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function categoryPayload() {
  return {
    parentId: null,
    code: "TRUCKS",
    slug: "trucks",
    defaultName: "Trucks",
    defaultDescription: "Truck categories",
    status: "ACTIVE" as const,
    sortOrder: 10,
    seoConfig: "{}",
    displayConfig: "{}"
  };
}

function categoryData(id: number) {
  return {
    id,
    children: [],
    ...categoryPayload()
  };
}
