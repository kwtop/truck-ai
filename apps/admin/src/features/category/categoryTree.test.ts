import { describe, expect, it } from "vitest";
import { countCategories, findCategoryById, toCategoryOptions } from "./categoryTree";
import type { VehicleCategory } from "./categoryApi";

describe("categoryTree", () => {
  const categories: VehicleCategory[] = [
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
      children: [
        {
          id: 2,
          parentId: 1,
          code: "TANK_TRUCK",
          slug: "tank-truck",
          defaultName: "Tank Truck",
          defaultDescription: "",
          status: "ACTIVE",
          sortOrder: 20,
          seoConfig: "{}",
          displayConfig: "{}",
          children: []
        }
      ]
    }
  ];

  it("counts nested categories", () => {
    expect(countCategories(categories)).toBe(2);
  });

  it("builds tree select options and disables the edited node", () => {
    expect(toCategoryOptions(categories, 1)).toEqual([
      {
        label: "Trucks",
        value: 1,
        disabled: true,
        children: [
          {
            label: "Tank Truck",
            value: 2,
            disabled: false,
            children: []
          }
        ]
      }
    ]);
  });

  it("finds nested category records", () => {
    expect(findCategoryById(categories, 2)?.code).toBe("TANK_TRUCK");
    expect(findCategoryById(categories, 99)).toBeNull();
  });
});
