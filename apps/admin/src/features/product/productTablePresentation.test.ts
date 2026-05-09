import { describe, expect, it } from "vitest";

import {
  productCategoryLabel,
  productEmptyDescription,
  productFlagLabels,
  productStatusColor
} from "./productTablePresentation";

describe("productTablePresentation", () => {
  it("maps product statuses to table tag colors", () => {
    expect(productStatusColor("DRAFT")).toBe("blue");
    expect(productStatusColor("PUBLISHED")).toBe("green");
    expect(productStatusColor("OFFLINE")).toBe("default");
  });

  it("builds feature and AI table flags", () => {
    expect(productFlagLabels({ featured: true, aiEnabled: true })).toEqual([
      { label: "Featured", color: "gold" },
      { label: "AI", color: "purple" }
    ]);
    expect(productFlagLabels({ featured: false, aiEnabled: false })).toEqual([]);
  });

  it("resolves category labels and empty table descriptions", () => {
    expect(productCategoryLabel(new Map([[9, "Fuel Tank Truck"]]), 9)).toBe("Fuel Tank Truck");
    expect(productCategoryLabel(new Map(), 99)).toBe("99");
    expect(productEmptyDescription(new Error("Unable to load products"))).toBe("Unable to load products");
    expect(productEmptyDescription(null)).toBe("No products");
  });
});
