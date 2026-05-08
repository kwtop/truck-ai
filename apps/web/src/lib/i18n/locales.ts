import enMessages from "../../../messages/en-US.json";
import esMessages from "../../../messages/es-MX.json";
import frMessages from "../../../messages/fr-DZ.json";

export const locales = ["en-US", "es-MX", "fr-DZ"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en-US";

const messagesByLocale: Record<Locale, typeof enMessages> = {
  "en-US": enMessages,
  "es-MX": esMessages,
  "fr-DZ": frMessages
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getMessages(locale: Locale) {
  return messagesByLocale[locale];
}
