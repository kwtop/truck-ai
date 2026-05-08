import type { VehicleCategory } from "./categoryApi";

export type CategoryOption = {
  label: string;
  value: number;
  disabled?: boolean;
  children?: CategoryOption[];
};

export function toCategoryOptions(
  categories: VehicleCategory[],
  disabledCategoryId?: number
): CategoryOption[] {
  return categories.map((category) => ({
    label: category.defaultName,
    value: category.id,
    disabled: category.id === disabledCategoryId,
    children: toCategoryOptions(category.children ?? [], disabledCategoryId)
  }));
}

export function countCategories(categories: VehicleCategory[]): number {
  return categories.reduce(
    (total, category) => total + 1 + countCategories(category.children ?? []),
    0
  );
}

export function findCategoryById(
  categories: VehicleCategory[],
  id: number
): VehicleCategory | null {
  for (const category of categories) {
    if (category.id === id) {
      return category;
    }

    const child = findCategoryById(category.children ?? [], id);
    if (child) {
      return child;
    }
  }

  return null;
}
