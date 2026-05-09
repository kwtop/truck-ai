import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/stores/authStore";
import { ButtonApiError, createButton, listButtons, updateButton } from "./buttonApi";

describe("buttonApi", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    useAuthStore.setState({
      token: "jwt-token",
      tokenType: "Bearer",
      permissions: ["button:read", "button:write"],
      isAuthenticated: true
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    useAuthStore.getState().logout();
  });

  it("loads buttons with filters and authorization", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ success: true, data: [buttonData()] }));

    const buttons = await listButtons({
      placement: "home_hero",
      locale: "en-US",
      status: "ACTIVE",
      actionType: "WHATSAPP",
      keyword: "quote"
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/admin/buttons?placement=home_hero&locale=en-US&status=ACTIVE&actionType=WHATSAPP&keyword=quote",
      expect.objectContaining({})
    );
    const init = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer jwt-token");
    expect(headers["Content-Type"]).toBe("application/json");
    expect(buttons[0].buttonKey).toBe("primary_quote");
  });

  it("creates and updates buttons", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ success: true, data: buttonData(2) }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: buttonData(2) }));

    await createButton(buttonPayload());
    await updateButton(2, { ...buttonPayload(), text: "Request Pricing" });

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "/api/admin/buttons",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("primary_quote") })
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "/api/admin/buttons/2",
      expect.objectContaining({ method: "PUT", body: expect.stringContaining("Request Pricing") })
    );
  });

  it("throws normalized backend errors", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Unsupported button action type"
          }
        },
        400
      )
    );

    await expect(createButton(buttonPayload())).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "Unsupported button action type"
    } satisfies Partial<ButtonApiError>);
  });
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function buttonData(id = 1) {
  return {
    id,
    buttonKey: "primary_quote",
    placement: "home_hero",
    locale: "en-US",
    text: "Request quote",
    actionType: "WHATSAPP" as const,
    actionConfig: { phone: "+521234567890" },
    styleConfig: { variant: "primary" },
    status: "ACTIVE" as const,
    sortOrder: 10,
    createdAt: "2026-05-09T00:00:00Z",
    updatedAt: "2026-05-09T00:00:00Z"
  };
}

function buttonPayload() {
  return {
    buttonKey: "primary_quote",
    placement: "home_hero",
    locale: "en-US",
    text: "Request quote",
    actionType: "WHATSAPP" as const,
    actionConfig: { phone: "+521234567890" },
    styleConfig: { variant: "primary" },
    status: "ACTIVE" as const,
    sortOrder: 10
  };
}
