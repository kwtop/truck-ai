import type { Product, ProductPayload, ProductStatus, ProductTranslationPayload } from "./productApi";

export type ProductFormValues = {
  categoryId: number | null;
  sku: string;
  slug: string;
  defaultName: string;
  defaultSummary: string;
  status: ProductStatus;
  specs: Record<string, unknown>;
  seoConfigJson: string;
  shippingConfigJson: string;
  aiEnabled: boolean;
  featured: boolean;
  sortOrder: number;
  translationLocale: string;
  translationName: string;
  translationSummary: string;
  translationDescription: string;
  translationApplications: string;
  localizedSpecsJson: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
};

export function defaultProductFormValues(categoryId: number | null = null): ProductFormValues {
  return {
    categoryId,
    sku: "",
    slug: "",
    defaultName: "",
    defaultSummary: "",
    status: "DRAFT",
    specs: {},
    seoConfigJson: "{}",
    shippingConfigJson: "{}",
    aiEnabled: true,
    featured: false,
    sortOrder: 0,
    translationLocale: "en-US",
    translationName: "",
    translationSummary: "",
    translationDescription: "",
    translationApplications: "",
    localizedSpecsJson: "{}",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: ""
  };
}

export function productToFormValues(product: Product): ProductFormValues {
  return {
    ...defaultProductFormValues(product.categoryId),
    sku: product.sku ?? "",
    slug: product.slug,
    defaultName: product.defaultName,
    defaultSummary: product.defaultSummary ?? "",
    status: product.status,
    specs: product.specs ?? {},
    seoConfigJson: stringifyJson(product.seoConfig ?? {}),
    shippingConfigJson: stringifyJson(product.shippingConfig ?? {}),
    aiEnabled: product.aiEnabled,
    featured: product.featured,
    sortOrder: product.sortOrder,
    translationName: product.defaultName,
    translationSummary: product.defaultSummary ?? ""
  };
}

export function formValuesToProductPayload(values: ProductFormValues): ProductPayload {
  if (values.categoryId === null) {
    throw new Error("Category is required");
  }

  return {
    categoryId: values.categoryId,
    sku: values.sku?.trim() ?? "",
    slug: values.slug.trim(),
    defaultName: values.defaultName.trim(),
    defaultSummary: values.defaultSummary?.trim() ?? "",
    status: values.status,
    specs: compactSpecValues(values.specs ?? {}),
    seoConfig: parseJsonObject(values.seoConfigJson, "SEO config"),
    shippingConfig: parseJsonObject(values.shippingConfigJson, "Shipping config"),
    aiEnabled: Boolean(values.aiEnabled),
    featured: Boolean(values.featured),
    sortOrder: values.sortOrder ?? 0
  };
}

export function formValuesToTranslationPayload(values: ProductFormValues): ProductTranslationPayload | null {
  if (!values.translationLocale.trim() || !values.translationName.trim()) {
    return null;
  }

  return {
    name: values.translationName.trim(),
    summary: values.translationSummary?.trim() ?? "",
    description: values.translationDescription?.trim() ?? "",
    applications: values.translationApplications?.trim() ?? "",
    localizedSpecs: parseJsonObject(values.localizedSpecsJson, "Localized specs"),
    seoTitle: values.seoTitle?.trim() ?? "",
    seoDescription: values.seoDescription?.trim() ?? "",
    seoKeywords: values.seoKeywords?.trim() ?? "",
    canonicalUrl: values.canonicalUrl?.trim() ?? "",
    ogTitle: values.ogTitle?.trim() ?? "",
    ogDescription: values.ogDescription?.trim() ?? "",
    ogImage: values.ogImage?.trim() ?? ""
  };
}

export function parseJsonObject(value: string, label: string): Record<string, unknown> {
  const normalized = value?.trim() || "{}";
  try {
    const parsed = JSON.parse(normalized);
    if (parsed === null || Array.isArray(parsed) || typeof parsed !== "object") {
      throw new Error(`${label} must be a JSON object`);
    }
    return parsed as Record<string, unknown>;
  } catch (error) {
    if (error instanceof Error && error.message.includes("must be a JSON object")) {
      throw error;
    }
    throw new Error(`${label} must be valid JSON`);
  }
}

export function compactSpecValues(specs: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(specs).filter(([, value]) => {
      if (value === null || value === undefined || value === "") {
        return false;
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === "object") {
        return Object.keys(value).length > 0;
      }
      return true;
    })
  );
}

function stringifyJson(value: Record<string, unknown>) {
  return JSON.stringify(value, null, 2);
}
