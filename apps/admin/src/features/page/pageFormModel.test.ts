import { describe, expect, it } from "vitest";
import {
  blockToFormValues,
  buttonToFormValues,
  defaultBlockFormValues,
  defaultButtonFormValues,
  defaultPageFormValues,
  formValuesToBlockPayload,
  formValuesToButtonPayload,
  formValuesToPagePayload,
  pageToFormValues,
  parseJsonObject
} from "./pageFormModel";

describe("pageFormModel", () => {
  it("builds default page, block and button values", () => {
    expect(defaultPageFormValues()).toMatchObject({ pageType: "CUSTOM", status: "DRAFT" });
    expect(defaultBlockFormValues(7)).toMatchObject({ pageId: 7, visible: true });
    expect(defaultButtonFormValues()).toMatchObject({ actionType: "RFQ", status: "ACTIVE" });
  });

  it("maps API data to form JSON strings", () => {
    expect(pageToFormValues(page()).seoConfigJson).toContain("Export Trucks");
    expect(blockToFormValues(block()).contentConfigJson).toContain("Hero");
    expect(buttonToFormValues(button()).actionConfigJson).toContain("phone");
  });

  it("creates page payloads from JSON text", () => {
    expect(
      formValuesToPagePayload({
        ...defaultPageFormValues(),
        pageType: "HOME",
        slug: " home ",
        title: " Home ",
        seoConfigJson: "{\"title\":\"Home\"}",
        pageConfigJson: "{\"layout\":\"default\"}"
      })
    ).toEqual(
      expect.objectContaining({
        pageType: "HOME",
        slug: "home",
        title: "Home",
        seoConfig: { title: "Home" },
        pageConfig: { layout: "default" }
      })
    );
  });

  it("creates block and button payloads from JSON text", () => {
    expect(
      formValuesToBlockPayload({
        ...defaultBlockFormValues(9),
        blockKey: " hero ",
        contentConfigJson: "{\"title\":\"Hero\"}",
        styleConfigJson: "{\"variant\":\"wide\"}"
      })
    ).toMatchObject({
      pageId: 9,
      blockKey: "hero",
      contentConfig: { title: "Hero" },
      styleConfig: { variant: "wide" }
    });

    expect(
      formValuesToButtonPayload({
        ...defaultButtonFormValues(),
        buttonKey: " cta ",
        placement: " home_hero ",
        text: " Quote ",
        actionConfigJson: "{\"source\":\"home\"}"
      })
    ).toMatchObject({
      buttonKey: "cta",
      placement: "home_hero",
      text: "Quote",
      actionConfig: { source: "home" }
    });
  });

  it("rejects invalid JSON and missing block page", () => {
    expect(() => parseJsonObject("[]", "Action config")).toThrow("Action config must be a JSON object");
    expect(() => parseJsonObject("{", "Style config")).toThrow("Style config must be valid JSON");
    expect(() => formValuesToBlockPayload(defaultBlockFormValues(null))).toThrow("Page is required");
  });
});

function page() {
  return {
    id: 1,
    pageType: "HOME" as const,
    slug: "home",
    locale: "en-US",
    title: "Home",
    status: "DRAFT" as const,
    seoConfig: { title: "Export Trucks" },
    pageConfig: { layout: "default" },
    publishedAt: null,
    createdBy: 1,
    updatedBy: 1,
    createdAt: "2026-05-09T00:00:00Z",
    updatedAt: "2026-05-09T00:00:00Z"
  };
}

function block() {
  return {
    id: 1,
    pageId: 1,
    blockKey: "home_hero",
    blockType: "HERO_BANNER" as const,
    locale: "en-US",
    visible: true,
    sortOrder: 10,
    contentConfig: { title: "Hero" },
    styleConfig: { variant: "wide" },
    createdAt: "2026-05-09T00:00:00Z",
    updatedAt: "2026-05-09T00:00:00Z"
  };
}

function button() {
  return {
    id: 1,
    buttonKey: "primary_quote",
    placement: "home_hero",
    locale: "en-US",
    text: "Quote",
    actionType: "WHATSAPP" as const,
    actionConfig: { phone: "+521234567890" },
    styleConfig: { variant: "primary" },
    status: "ACTIVE" as const,
    sortOrder: 10,
    createdAt: "2026-05-09T00:00:00Z",
    updatedAt: "2026-05-09T00:00:00Z"
  };
}
