import type { SiteButtonConfig, SiteButtonConfigPayload } from "@/features/button/buttonApi";
import type {
  SitePage,
  SitePageBlock,
  SitePageBlockPayload,
  SitePageBlockType,
  SitePagePayload,
  SitePageStatus,
  SitePageType
} from "./pageApi";
import type { ButtonActionType, ButtonStatus } from "@/features/button/buttonApi";

export type SitePageFormValues = {
  pageType: SitePageType;
  slug: string;
  locale: string;
  title: string;
  status: SitePageStatus;
  seoConfigJson: string;
  pageConfigJson: string;
};

export type SitePageBlockFormValues = {
  pageId: number | null;
  blockKey: string;
  blockType: SitePageBlockType;
  locale: string;
  visible: boolean;
  sortOrder: number;
  contentConfigJson: string;
  styleConfigJson: string;
};

export type SiteButtonConfigFormValues = {
  buttonKey: string;
  placement: string;
  locale: string;
  text: string;
  actionType: ButtonActionType;
  actionConfigJson: string;
  styleConfigJson: string;
  status: ButtonStatus;
  sortOrder: number;
};

export function defaultPageFormValues(): SitePageFormValues {
  return {
    pageType: "CUSTOM",
    slug: "",
    locale: "en-US",
    title: "",
    status: "DRAFT",
    seoConfigJson: "{}",
    pageConfigJson: "{}"
  };
}

export function defaultBlockFormValues(pageId: number | null = null): SitePageBlockFormValues {
  return {
    pageId,
    blockKey: "",
    blockType: "RICH_TEXT",
    locale: "en-US",
    visible: true,
    sortOrder: 0,
    contentConfigJson: "{}",
    styleConfigJson: "{}"
  };
}

export function defaultButtonFormValues(): SiteButtonConfigFormValues {
  return {
    buttonKey: "",
    placement: "",
    locale: "en-US",
    text: "",
    actionType: "RFQ",
    actionConfigJson: "{}",
    styleConfigJson: "{}",
    status: "ACTIVE",
    sortOrder: 0
  };
}

export function pageToFormValues(page: SitePage): SitePageFormValues {
  return {
    pageType: page.pageType,
    slug: page.slug,
    locale: page.locale,
    title: page.title,
    status: page.status,
    seoConfigJson: stringifyJson(page.seoConfig),
    pageConfigJson: stringifyJson(page.pageConfig)
  };
}

export function blockToFormValues(block: SitePageBlock): SitePageBlockFormValues {
  return {
    pageId: block.pageId,
    blockKey: block.blockKey,
    blockType: block.blockType,
    locale: block.locale,
    visible: block.visible,
    sortOrder: block.sortOrder,
    contentConfigJson: stringifyJson(block.contentConfig),
    styleConfigJson: stringifyJson(block.styleConfig)
  };
}

export function buttonToFormValues(button: SiteButtonConfig): SiteButtonConfigFormValues {
  return {
    buttonKey: button.buttonKey,
    placement: button.placement,
    locale: button.locale,
    text: button.text,
    actionType: button.actionType,
    actionConfigJson: stringifyJson(button.actionConfig),
    styleConfigJson: stringifyJson(button.styleConfig),
    status: button.status,
    sortOrder: button.sortOrder
  };
}

export function formValuesToPagePayload(values: SitePageFormValues): SitePagePayload {
  return {
    pageType: values.pageType,
    slug: values.slug.trim(),
    locale: values.locale.trim(),
    title: values.title.trim(),
    status: values.status,
    seoConfig: parseJsonObject(values.seoConfigJson, "SEO config"),
    pageConfig: parseJsonObject(values.pageConfigJson, "Page config")
  };
}

export function formValuesToBlockPayload(values: SitePageBlockFormValues): SitePageBlockPayload {
  if (values.pageId === null || values.pageId === undefined) {
    throw new Error("Page is required");
  }

  return {
    pageId: values.pageId,
    blockKey: values.blockKey.trim(),
    blockType: values.blockType,
    locale: values.locale.trim(),
    visible: Boolean(values.visible),
    sortOrder: values.sortOrder ?? 0,
    contentConfig: parseJsonObject(values.contentConfigJson, "Content config"),
    styleConfig: parseJsonObject(values.styleConfigJson, "Style config")
  };
}

export function formValuesToButtonPayload(values: SiteButtonConfigFormValues): SiteButtonConfigPayload {
  return {
    buttonKey: values.buttonKey.trim(),
    placement: values.placement.trim(),
    locale: values.locale.trim(),
    text: values.text.trim(),
    actionType: values.actionType,
    actionConfig: parseJsonObject(values.actionConfigJson, "Action config"),
    styleConfig: parseJsonObject(values.styleConfigJson, "Style config"),
    status: values.status,
    sortOrder: values.sortOrder ?? 0
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

function stringifyJson(value: Record<string, unknown>) {
  return JSON.stringify(value ?? {}, null, 2);
}
