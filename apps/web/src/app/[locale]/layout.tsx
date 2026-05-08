import type {Metadata} from "next";
import {NextIntlClientProvider} from "next-intl";
import {notFound} from "next/navigation";
import type {ReactNode} from "react";

import "./globals.css";
import {defaultLocale, getMessages, isLocale, locales} from "@/lib/i18n/locales";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export const metadata: Metadata = {
  title: "B2B Export Truck Platform",
  description: "Multilingual independent site for export truck products and RFQ conversion."
};

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({children, params}: LocaleLayoutProps) {
  const {locale} = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const messages = getMessages(locale);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export const viewport = {
  width: "device-width",
  initialScale: 1
};

export const dynamicParams = false;

export const preferredRegion = "auto";

export const revalidate = false;
