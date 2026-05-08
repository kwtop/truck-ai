import { describe, expect, it } from "vitest";
import {
  compactSpecValues,
  defaultProductFormValues,
  formValuesToProductPayload,
  formValuesToTranslationPayload,
  parseJsonObject,
  productToFormValues
} from "./productFormModel";

describe("productFormModel", () => {
  it("builds default values with selected category", () => {
    expect(defaultProductFormValues(9)).toMatchObject({
      categoryId: 9,
      status: "DRAFT",
      aiEnabled: true,
      translationLocale: "en-US"
    });
  });

  it("maps API products into form values", () => {
    expect(productToFormValues(product()).seoConfigJson).toContain("Fuel Tank Truck");
    expect(productToFormValues(product())).toMatchObject({
      categoryId: 9,
      slug: "fuel-tank-truck-10000l",
      specs: { tank_capacity: 10000 }
    });
  });

  it("builds product payloads with parsed JSON fields", () => {
    expect(
      formValuesToProductPayload({
        ...defaultProductFormValues(9),
        sku: " SKU-1 ",
        slug: " fuel-tank-truck ",
        defaultName: " Fuel Tank Truck ",
        specs: { tank_capacity: 10000, empty: "" },
        seoConfigJson: "{\"title\":\"SEO\"}",
        shippingConfigJson: "{\"container\":\"40HQ\"}"
      })
    ).toEqual(
      expect.objectContaining({
        categoryId: 9,
        sku: "SKU-1",
        slug: "fuel-tank-truck",
        defaultName: "Fuel Tank Truck",
        specs: { tank_capacity: 10000 },
        seoConfig: { title: "SEO" },
        shippingConfig: { container: "40HQ" }
      })
    );
  });

  it("builds optional translation payloads", () => {
    expect(formValuesToTranslationPayload(defaultProductFormValues(9))).toBeNull();
    expect(
      formValuesToTranslationPayload({
        ...defaultProductFormValues(9),
        translationName: "Camion cisterna",
        localizedSpecsJson: "{\"tank_capacity\":\"10000 L\"}"
      })
    ).toMatchObject({
      name: "Camion cisterna",
      localizedSpecs: { tank_capacity: "10000 L" }
    });
  });

  it("rejects invalid JSON object fields", () => {
    expect(() => parseJsonObject("[]", "SEO config")).toThrow("SEO config must be a JSON object");
    expect(() => parseJsonObject("{", "Shipping config")).toThrow(
      "Shipping config must be valid JSON"
    );
  });

  it("removes empty specs before submit", () => {
    expect(compactSpecValues({ a: "", b: [], c: null, d: 0, e: false })).toEqual({
      d: 0,
      e: false
    });
  });
});

function product() {
  return {
    id: 1,
    categoryId: 9,
    sku: "SKU-1",
    slug: "fuel-tank-truck-10000l",
    defaultName: "10,000L Fuel Tank Truck",
    defaultSummary: "Truck",
    status: "DRAFT" as const,
    specs: { tank_capacity: 10000 },
    seoConfig: { title: "Fuel Tank Truck" },
    shippingConfig: {},
    aiEnabled: true,
    featured: false,
    sortOrder: 10,
    publishedAt: null,
    createdBy: 1,
    updatedBy: 1,
    createdAt: "2026-05-01T00:00:00Z",
    updatedAt: "2026-05-01T00:00:00Z"
  };
}
