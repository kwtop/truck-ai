import { Form } from "antd";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CategoryForm } from "./CategoryForm";
import type { CategoryPayload, VehicleCategory } from "./categoryApi";

describe("CategoryForm", () => {
  it("renders CRUD category fields and disables the edited node in parent options", () => {
    function FormHost() {
      const [form] = Form.useForm<CategoryPayload>();
      return <CategoryForm form={form} categories={categories()} editingCategory={categories()[0]} />;
    }

    const html = renderToStaticMarkup(<FormHost />);

    expect(html).toContain("Parent category");
    expect(html).toContain("Code");
    expect(html).toContain("Slug");
    expect(html).toContain("Default name");
    expect(html).toContain("SEO config");
    expect(html).toContain("Display config");
    expect(html).toContain("Root category");
  });
});

function categories(): VehicleCategory[] {
  return [
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
  ];
}
