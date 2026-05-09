import { Form } from "antd";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProductForm } from "./ProductForm";
import type { ProductFormValues } from "./productFormModel";
import type { VehicleAttributeDefinition } from "@/features/attribute/attributeApi";

describe("ProductForm", () => {
  it("renders product CRUD fields, dynamic specs, and translation inputs", () => {
    function FormHost() {
      const [form] = Form.useForm<ProductFormValues>();
      return (
        <ProductForm
          form={form}
          categoryOptions={[{ label: "Fuel Tank Truck", value: 9 }]}
          attributes={attributes()}
        />
      );
    }

    const html = renderToStaticMarkup(<FormHost />);

    expect(html).toContain("Product");
    expect(html).toContain("Category");
    expect(html).toContain("SKU");
    expect(html).toContain("Dynamic specs");
    expect(html).toContain("Tank Capacity (L)");
    expect(html).toContain("Tank Material");
    expect(html).toContain("Operating Range");
    expect(html).not.toContain("Disabled Spec");
    expect(html).toContain("SEO and shipping");
    expect(html).toContain("Translation");
    expect(html).toContain("Localized name");
  });

  it("shows loading and empty dynamic spec states", () => {
    function LoadingHost() {
      const [form] = Form.useForm<ProductFormValues>();
      return <ProductForm form={form} categoryOptions={[]} attributes={[]} loadingAttributes />;
    }
    function EmptyHost() {
      const [form] = Form.useForm<ProductFormValues>();
      return <ProductForm form={form} categoryOptions={[]} attributes={[]} />;
    }

    expect(renderToStaticMarkup(<LoadingHost />)).toContain("Loading specs template...");
    expect(renderToStaticMarkup(<EmptyHost />)).toContain("Select a category with active attributes.");
  });
});

function attributes(): VehicleAttributeDefinition[] {
  return [
    attribute({ id: 1, code: "tank_capacity", defaultLabel: "Tank Capacity", dataType: "number", unit: "L", required: true }),
    attribute({ id: 2, code: "tank_material", defaultLabel: "Tank Material", dataType: "select", options: "[\"Carbon Steel\",\"Stainless Steel\"]" }),
    attribute({ id: 3, code: "operating_range", defaultLabel: "Operating Range", dataType: "range" }),
    attribute({ id: 4, code: "disabled_spec", defaultLabel: "Disabled Spec", status: "DISABLED" })
  ];
}

function attribute(overrides: Partial<VehicleAttributeDefinition>): VehicleAttributeDefinition {
  return {
    id: 1,
    categoryId: 9,
    code: "spec",
    defaultLabel: "Spec",
    dataType: "text",
    unit: "",
    options: "[]",
    validationRules: "{}",
    uiConfig: "{}",
    required: false,
    filterable: false,
    comparable: false,
    sortOrder: 10,
    status: "ACTIVE",
    ...overrides
  };
}
