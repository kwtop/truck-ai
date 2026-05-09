import type { Product, ProductStatus } from "./productApi";

export function productStatusColor(status: ProductStatus) {
  const colors: Record<ProductStatus, string> = {
    DRAFT: "blue",
    PUBLISHED: "green",
    OFFLINE: "default"
  };
  return colors[status];
}

export function productFlagLabels(product: Pick<Product, "featured" | "aiEnabled">) {
  return [
    product.featured ? { label: "Featured", color: "gold" } : null,
    product.aiEnabled ? { label: "AI", color: "purple" } : null
  ].filter(Boolean) as Array<{ label: string; color: string }>;
}

export function productCategoryLabel(categoryNameById: Map<number, string>, categoryId: number) {
  return categoryNameById.get(categoryId) ?? String(categoryId);
}

export function productEmptyDescription(error: unknown) {
  return error instanceof Error ? error.message : "No products";
}
