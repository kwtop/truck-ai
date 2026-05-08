import {notFound} from "next/navigation";

export type ProductMedia = {
  id?: number | string;
  url?: string;
  type?: string;
  mediaType?: string;
  title?: string;
  alt?: string;
  sortOrder?: number;
};

export type ProductButton = {
  label?: string;
  url?: string;
  type?: string;
};

export type PublicProductDetail = {
  id: number;
  sku: string;
  slug: string;
  name: string;
  summary?: string | null;
  description?: string | null;
  applications?: string | null;
  categoryId: number;
  categorySlug: string;
  categoryName: string;
  specs?: Record<string, unknown>;
  localizedSpecs?: Record<string, unknown>;
  seo?: Record<string, unknown>;
  shippingConfig?: Record<string, unknown>;
  featured: boolean;
  publishedAt?: string | null;
  media?: ProductMedia[];
  buttons?: ProductButton[];
};

type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error?: {
    code?: string;
    message?: string;
  } | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL ?? "http://localhost:8080";

export async function getPublicProductDetail(slug: string, locale: string): Promise<PublicProductDetail> {
  const url = new URL(`/api/public/products/${encodeURIComponent(slug)}`, API_BASE_URL);
  url.searchParams.set("locale", locale);

  const response = await fetch(url, {
    headers: {
      Accept: "application/json"
    },
    next: {
      revalidate: 60
    }
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error(`Product detail request failed with HTTP ${response.status}`);
  }

  const body = (await response.json()) as ApiResponse<PublicProductDetail>;
  if (!body.success || !body.data) {
    if (body.error?.code === "PRODUCT_NOT_FOUND") {
      notFound();
    }
    throw new Error(body.error?.message ?? "Product detail request failed");
  }

  return body.data;
}
