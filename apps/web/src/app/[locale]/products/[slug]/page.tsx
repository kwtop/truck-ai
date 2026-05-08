import type {Metadata} from "next";
import {notFound} from "next/navigation";
import type {ReactNode} from "react";

import {getPublicProductDetail, type ProductMedia} from "@/lib/api/products";
import {defaultLocale, isLocale} from "@/lib/i18n/locales";

type ProductDetailPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

const currencyFormatter = new Intl.NumberFormat("en-US");

export async function generateMetadata({params}: ProductDetailPageProps): Promise<Metadata> {
  const {locale, slug} = await params;
  const safeLocale = isLocale(locale) ? locale : defaultLocale;

  try {
    const product = await getPublicProductDetail(slug, safeLocale);
    const title = textValue(product.seo?.title) ?? product.name;
    const description = textValue(product.seo?.description) ?? product.summary ?? undefined;
    const image = textValue(product.seo?.ogImage) ?? imageMedia(product.media)[0]?.url;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: image ? [image] : undefined
      }
    };
  } catch {
    return {
      title: "Product detail"
    };
  }
}

export default async function ProductDetailPage({params}: ProductDetailPageProps) {
  const {locale, slug} = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const product = await getPublicProductDetail(slug, locale);
  const images = imageMedia(product.media);
  const documents = documentMedia(product.media);
  const specs = specRows(product.localizedSpecs, product.specs);
  const shipping = objectRows(product.shippingConfig);

  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:py-14">
          <div className="order-2 lg:order-1">
            <div className="aspect-[4/3] overflow-hidden rounded-md border border-slate-200 bg-slate-100">
              {images[0]?.url ? (
                <img
                  src={images[0].url}
                  alt={images[0].alt ?? product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#e2e8f0_0%,#f8fafc_42%,#ccfbf1_42%,#ccfbf1_72%,#fed7aa_72%,#fed7aa_100%)] px-6 text-center text-sm font-semibold text-slate-600">
                  Product media will appear here
                </div>
              )}
            </div>
            {images.length > 1 ? (
              <div className="mt-3 grid grid-cols-4 gap-3">
                {images.slice(1, 5).map((image, index) => (
                  <div key={mediaKey(image, index)} className="aspect-square overflow-hidden rounded-md border border-slate-200 bg-white">
                    {image.url ? (
                      <img src={image.url} alt={image.alt ?? product.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-sm font-semibold uppercase text-orange-700">{product.categoryName}</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-slate-950 md:text-5xl">{product.name}</h1>
            {product.summary ? <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{product.summary}</p> : null}

            <dl className="mt-6 grid gap-3 sm:grid-cols-3">
              <Fact label="SKU" value={product.sku} />
              <Fact label="Category" value={product.categorySlug} />
              <Fact label="Published" value={formatDate(product.publishedAt)} />
            </dl>

            <div className="mt-8 flex flex-wrap gap-3" id="rfq">
              <a className="rounded-md bg-teal-700 px-5 py-3 text-sm font-semibold text-white" href={`/${locale}/rfq?product=${encodeURIComponent(product.slug)}`}>
                Request a quote
              </a>
              <a className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900" href={`mailto:sales@example.com?subject=${encodeURIComponent(`RFQ: ${product.name}`)}`}>
                Email sales
              </a>
              {documents[0]?.url ? (
                <a className="rounded-md border border-orange-300 px-5 py-3 text-sm font-semibold text-orange-800" href={documents[0].url}>
                  Download PDF
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Panel title="Specifications">
            {specs.length ? (
              <dl className="grid gap-3 sm:grid-cols-2">
                {specs.map((item) => (
                  <div key={item.label} className="rounded-md border border-slate-200 bg-white p-4">
                    <dt className="text-xs font-semibold uppercase text-slate-500">{humanize(item.label)}</dt>
                    <dd className="mt-2 text-base font-semibold text-slate-950">{item.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <EmptyState text="Specifications are being prepared." />
            )}
          </Panel>

          <Panel title="Overview">
            <div className="space-y-5 text-base leading-8 text-slate-700">
              {product.description ? <p>{product.description}</p> : <EmptyState text="Product description is being prepared." />}
              {product.applications ? (
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Applications</h2>
                  <p className="mt-2">{product.applications}</p>
                </div>
              ) : null}
            </div>
          </Panel>
        </div>

        <aside className="space-y-6">
          <Panel title="Documents">
            {documents.length ? (
              <div className="space-y-3">
                {documents.map((item, index) => (
                  <a key={mediaKey(item, index)} className="block rounded-md border border-slate-200 bg-white p-4 text-sm font-semibold text-teal-800" href={item.url}>
                    {item.title ?? item.alt ?? "Product PDF"}
                  </a>
                ))}
              </div>
            ) : (
              <EmptyState text="PDF brochures will be available after media upload." />
            )}
          </Panel>

          <Panel title="Shipping">
            {shipping.length ? (
              <dl className="space-y-3">
                {shipping.map((item) => (
                  <div key={item.label} className="flex justify-between gap-4 border-b border-slate-100 pb-3 text-sm">
                    <dt className="text-slate-500">{humanize(item.label)}</dt>
                    <dd className="font-semibold text-slate-950">{item.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <EmptyState text="Shipping data is available on request." />
            )}
          </Panel>
        </aside>
      </section>
    </main>
  );
}

function Fact({label, value}: {label: string; value?: string | null}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-2 min-h-6 text-sm font-semibold text-slate-950">{value || "-"}</dd>
    </div>
  );
}

function Panel({title, children}: {title: string; children: ReactNode}) {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-semibold text-slate-950">{title}</h2>
      {children}
    </section>
  );
}

function EmptyState({text}: {text: string}) {
  return <p className="rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">{text}</p>;
}

function imageMedia(media: ProductMedia[] = []) {
  return media.filter((item) => {
    const type = `${item.mediaType ?? item.type ?? ""}`.toLowerCase();
    return type.includes("image") || /\.(png|jpe?g|webp|gif)$/i.test(item.url ?? "");
  });
}

function documentMedia(media: ProductMedia[] = []) {
  return media.filter((item) => {
    const type = `${item.mediaType ?? item.type ?? ""}`.toLowerCase();
    return type.includes("pdf") || /\.(pdf)$/i.test(item.url ?? "");
  });
}

function specRows(primary?: Record<string, unknown>, fallback?: Record<string, unknown>) {
  const merged = {...(fallback ?? {}), ...(primary ?? {})};
  return objectRows(merged);
}

function objectRows(value?: Record<string, unknown>) {
  return Object.entries(value ?? {})
    .filter(([, item]) => item !== null && item !== undefined && item !== "")
    .map(([label, item]) => ({
      label,
      value: formatValue(item)
    }));
}

function formatValue(value: unknown): string {
  if (typeof value === "number") {
    return currencyFormatter.format(value);
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (Array.isArray(value)) {
    return value.map(formatValue).join(", ");
  }
  if (typeof value === "object" && value !== null) {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${humanize(key)}: ${formatValue(item)}`)
      .join("; ");
  }
  return String(value);
}

function formatDate(value?: string | null) {
  if (!value) {
    return null;
  }
  return new Intl.DateTimeFormat("en-US", {dateStyle: "medium"}).format(new Date(value));
}

function humanize(value: string) {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function textValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function mediaKey(item: ProductMedia, index: number) {
  return item.id ?? item.url ?? index;
}
