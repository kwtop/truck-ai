import {getRequestConfig} from "next-intl/server";

import {defaultLocale, getMessages, isLocale} from "@/lib/i18n/locales";

export default getRequestConfig(async ({requestLocale}) => {
  const requestedLocale = await requestLocale;
  const locale = requestedLocale && isLocale(requestedLocale) ? requestedLocale : defaultLocale;

  return {
    locale,
    messages: getMessages(locale)
  };
});
