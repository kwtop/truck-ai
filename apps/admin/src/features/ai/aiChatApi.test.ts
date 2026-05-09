import { afterEach, describe, expect, it, vi } from "vitest";

import { useAuthStore } from "@/stores/authStore";

import { chatSessionSearchParams, getAiChatSession, listAiChatSessions } from "./aiChatApi";

describe("aiChatApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    useAuthStore.getState().logout();
  });

  it("builds chat session search params", () => {
    const params = chatSessionSearchParams({
      keyword: " maria ",
      locale: "en-US",
      hasLead: true,
      page: 2,
      pageSize: 50
    });

    expect(params.toString()).toBe("keyword=maria&locale=en-US&hasLead=true&page=2&pageSize=50");
  });

  it("lists chat sessions with auth header", async () => {
    useAuthStore.getState().setLoginSession({
      token: "token-1",
      tokenType: "Bearer",
      expiresIn: 7200,
      user: { id: 1, username: "admin", displayName: "Admin" },
      permissions: ["ai:read"]
    });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { items: [], page: 1, pageSize: 20, total: 0 }
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(listAiChatSessions({ locale: "en-US" })).resolves.toMatchObject({ total: 0 });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/ai/chat-sessions?locale=en-US",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer token-1" })
      })
    );
  });

  it("loads chat session detail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            session: { id: 1, sessionNo: "AI-1", locale: "en-US", messageCount: 1 },
            messages: [{ id: 1, role: "USER", content: "Need truck", toolPayload: {}, tokenUsage: {} }]
          }
        })
      })
    );

    await expect(getAiChatSession(1)).resolves.toMatchObject({
      session: { sessionNo: "AI-1" },
      messages: [{ role: "USER" }]
    });
  });
});
