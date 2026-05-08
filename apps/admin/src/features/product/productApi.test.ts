import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ProductApiError,
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
  upsertProductTranslation
} from "./productApi";
import { useAuthStore } from "@/stores/authStore";

describe("productApi", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    useAuthStore.setState({
      token: "jwt-token",
      tokenType: "Bearer",
      permissions: ["product:read", "product:write"],
      isAuthenticated: true
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    useAuthStore.getState().logout();
  });

  it("loads products with filters and authorization", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ success: true, data: [productData(1)] }));

    const products = await listProducts({ categoryId: 9, keyword: "tank", status: "PUBLISHED" });

    expect(fetch).toHaveBeenCalledWith(
      "/api/admin/products?categoryId=9&keyword=tank&status=PUBLISHED",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-token"
        })
      })
    );
    expect(products[0].slug).toBe("fuel-tank-truck-10000l");
  });

  it("creates and updates product payloads", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ success: true, data: productData(1) }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: productData(1) }));

    await createProduct(productPayload());
    await updateProduct(1, productPayload());

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "/api/admin/products",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(productPayload())
      })
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "/api/admin/products/1",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify(productPayload())
      })
    );
  });

  it("deletes products and upserts translations", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ success: true }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: translationData() }));

    await deleteProduct(1);
    await upsertProductTranslation(1, "es-MX", translationPayload());

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "/api/admin/products/1",
      expect.objectContaining({ method: "DELETE" })
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "/api/admin/products/1/translations/es-MX",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify(translationPayload())
      })
    );
  });

  it("throws normalized backend errors", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: {
            code: "PRODUCT_SPEC_INVALID",
            message: "tank_capacity must be numeric"
          }
        },
        400
      )
    );

    await expect(createProduct(productPayload())).rejects.toMatchObject({
      code: "PRODUCT_SPEC_INVALID",
      message: "tank_capacity must be numeric"
    } satisfies Partial<ProductApiError>);
  });
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function productPayload() {
  return {
    categoryId: 9,
    sku: "SKU-1",
    slug: "fuel-tank-truck-10000l",
    defaultName: "10,000L Fuel Tank Truck",
    defaultSummary: "Truck",
    status: "DRAFT" as const,
    specs: { tank_capacity: 10000 },
    seoConfig: {},
    shippingConfig: {},
    aiEnabled: true,
    featured: false,
    sortOrder: 1
  };
}

function productData(id: number) {
  return {
    id,
    ...productPayload(),
    publishedAt: null,
    createdBy: 1,
    updatedBy: 1,
    createdAt: "2026-05-01T00:00:00Z",
    updatedAt: "2026-05-01T00:00:00Z"
  };
}

function translationPayload() {
  return {
    name: "Camion cisterna",
    summary: "",
    description: "",
    applications: "",
    localizedSpecs: {},
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: ""
  };
}

function translationData() {
  return {
    id: 1,
    productId: 1,
    locale: "es-MX",
    fallback: false,
    createdAt: "2026-05-01T00:00:00Z",
    updatedAt: "2026-05-01T00:00:00Z",
    ...translationPayload()
  };
}
