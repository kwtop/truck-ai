import { Tabs, Tag, Typography } from "antd";
import type { ReactNode } from "react";

export const supportedLocales = ["en-US", "es-MX", "fr-DZ"] as const;

export type SupportedLocale = (typeof supportedLocales)[number];

export const localeLabels: Record<SupportedLocale, string> = {
  "en-US": "English",
  "es-MX": "Spanish",
  "fr-DZ": "French"
};

type LocaleTabsProps = {
  value?: string;
  onChange?: (locale: SupportedLocale) => void;
  children: (locale: SupportedLocale) => ReactNode;
};

export function LocaleTabs({ value, onChange, children }: LocaleTabsProps) {
  const activeLocale = isSupportedLocale(value) ? value : "en-US";

  return (
    <div>
      <Tabs
        activeKey={activeLocale}
        onChange={(next) => {
          if (isSupportedLocale(next)) {
            onChange?.(next);
          }
        }}
        items={supportedLocales.map((locale) => ({
          key: locale,
          label: (
            <span>
              {localeLabels[locale]} <Tag>{locale}</Tag>
            </span>
          ),
          children: children(locale)
        }))}
      />
      <Typography.Text type="secondary">Editing locale: {activeLocale}</Typography.Text>
    </div>
  );
}

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return typeof value === "string" && supportedLocales.includes(value as SupportedLocale);
}
