import { describe, expect, it } from "vitest";
import { flattenCategoryOptions } from "./categoryOptions";
import type { VehicleCategory } from "@/features/category/categoryApi";

describe("categoryOptions", () => {
  it("flattens nested categories for selects", () => {
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

    expect(flattenCategoryOptions(categories)).toEqual([
      { label: "Trucks", value: 1 },
      { label: "  Tank Truck", value: 2 }
    ]);
  });
});
