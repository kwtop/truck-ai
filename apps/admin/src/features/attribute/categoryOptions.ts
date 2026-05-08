import type { VehicleCategory } from "@/features/category/categoryApi";

export type FlatCategoryOption = {
  label: string;
  value: number;
};

export function flattenCategoryOptions(categories: VehicleCategory[]): FlatCategoryOption[] {
  return flattenCategories(categories, 0);
}

function flattenCategories(categories: VehicleCategory[], depth: number): FlatCategoryOption[] {
  return categories.flatMap((category) => [
    {
      label: `${"  ".repeat(depth)}${category.defaultName}`,
      value: category.id
    },
    ...flattenCategories(category.children ?? [], depth + 1)
  ]);
}
