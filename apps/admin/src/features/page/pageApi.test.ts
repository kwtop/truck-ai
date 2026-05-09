import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/stores/authStore";
import {
  PageApiError,
  createPage,
  createPageBlock,
  listPageBlocks,
  listPages,
  updatePage
} from "./pageApi";

describe("pageApi", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    useAuthStore.setState({
      token: "jwt-token",
      tokenType: "Bearer",
      permissions: ["page:read", "page:write"],
      isAuthenticated: true
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    useAuthStore.getState().logout();
  });

  it("loads pages with filters and authorization", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ success: true, data: [pageData()] }));

    const pages = await listPages({
      pageType: "HOME",
      locale: "en-US",
      status: "PUBLISHED",
      keyword: "home"
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/admin/pages?pageType=HOME&locale=en-US&status=PUBLISHED&keyword=home",
      expect.objectContaining({})
    );
    const init = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer jwt-token");
    expect(headers["Content-Type"]).toBe("application/json");
    expect(pages[0].slug).toBe("home");
  });

  it("creates and updates pages", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ success: true, data: pageData(2) }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: pageData(2) }));

    await createPage(pagePayload());
    await updatePage(2, { ...pagePayload(), title: "Homepage" });

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "/api/admin/pages",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("\"slug\":\"home\"") })
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "/api/admin/pages/2",
      expect.objectContaining({ method: "PUT", body: expect.stringContaining("Homepage") })
    );
  });

  it("loads and creates page blocks", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ success: true, data: [blockData()] }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: blockData(3) }));

    await listPageBlocks({ pageId: 9, locale: "en-US", visible: true, blockType: "HERO_BANNER" });
    const block = await createPageBlock(blockPayload());

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "/api/admin/page-blocks?pageId=9&locale=en-US&visible=true&blockType=HERO_BANNER",
      expect.objectContaining({})
    );
    expect(block.id).toBe(3);
  });

  it("throws normalized backend errors", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "seoConfig must be a JSON object"
          }
        },
        400
      )
    );

    await expect(createPage(pagePayload())).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "seoConfig must be a JSON object"
    } satisfies Partial<PageApiError>);
  });
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function pageData(id = 1) {
  return {
    id,
    pageType: "HOME" as const,
    slug: "home",
    locale: "en-US",
    title: "Home",
    status: "PUBLISHED" as const,
    seoConfig: { title: "Home" },
    pageConfig: { layout: "default" },
    publishedAt: "2026-05-09T00:00:00Z",
    createdBy: 1,
    updatedBy: 1,
    createdAt: "2026-05-09T00:00:00Z",
    updatedAt: "2026-05-09T00:00:00Z"
  };
}

function pagePayload() {
  return {
    pageType: "HOME" as const,
    slug: "home",
    locale: "en-US",
    title: "Home",
    status: "PUBLISHED" as const,
    seoConfig: { title: "Home" },
    pageConfig: { layout: "default" }
  };
}

function blockData(id = 1) {
  return {
    id,
    pageId: 9,
    blockKey: "home_hero",
    blockType: "HERO_BANNER" as const,
    locale: "en-US",
    visible: true,
    sortOrder: 10,
    contentConfig: { title: "Trucks" },
    styleConfig: { variant: "hero" },
    createdAt: "2026-05-09T00:00:00Z",
    updatedAt: "2026-05-09T00:00:00Z"
  };
}

function blockPayload() {
  return {
    pageId: 9,
    blockKey: "home_hero",
    blockType: "HERO_BANNER" as const,
    locale: "en-US",
    visible: true,
    sortOrder: 10,
    contentConfig: { title: "Trucks" },
    styleConfig: { variant: "hero" }
  };
}
