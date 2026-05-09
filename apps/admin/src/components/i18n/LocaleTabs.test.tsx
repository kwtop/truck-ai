import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { isSupportedLocale, LocaleTabs, supportedLocales } from "./LocaleTabs";

describe("LocaleTabs", () => {
  it("renders the launch locale tabs and active locale content", () => {
    const html = renderToStaticMarkup(
      <LocaleTabs value="es-MX">{(locale) => <div>Content for {locale}</div>}</LocaleTabs>
    );

    expect(html).toContain("English");
    expect(html).toContain("Spanish");
    expect(html).toContain("French");
    expect(html).toContain("Editing locale: es-MX");
  });

  it("falls back to en-US for unsupported values", () => {
    const html = renderToStaticMarkup(
      <LocaleTabs value="pt-BR">{(locale) => <div>Content for {locale}</div>}</LocaleTabs>
    );

    expect(html).toContain("Editing locale: en-US");
  });

  it("exports supported locale guards", () => {
    expect(supportedLocales).toEqual(["en-US", "es-MX", "fr-DZ"]);
    expect(isSupportedLocale("fr-DZ")).toBe(true);
    expect(isSupportedLocale("de-DE")).toBe(false);
  });
});
