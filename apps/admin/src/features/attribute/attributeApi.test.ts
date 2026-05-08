import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AttributeApiError,
  createAttribute,
  listAttributes,
  updateAttribute
} from "./attributeApi";
import { useAuthStore } from "@/stores/authStore";

describe("attributeApi", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    useAuthStore.setState({
      token: "jwt-token",
      tokenType: "Bearer",
      permissions: ["attribute:read", "attribute:write"],
      isAuthenticated: true
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    useAuthStore.getState().logout();
  });

  it("loads attributes by category with authorization", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: [attributeData(1)]
      })
    );

    const attributes = await listAttributes(7);

    expect(fetch).toHaveBeenCalledWith(
      "/api/admin/attributes?categoryId=7",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-token"
        })
      })
    );
    expect(attributes[0].code).toBe("tank_capacity");
  });

  it("posts create payloads", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ success: true, data: attributeData(1) }));

    await createAttribute(attributePayload());

    expect(fetch).toHaveBeenCalledWith(
      "/api/admin/attributes",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(attributePayload()),
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer jwt-token"
        })
      })
    );
  });

  it("puts update payloads", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ success: true, data: attributeData(2) }));

    await updateAttribute(2, attributePayload());

    expect(fetch).toHaveBeenCalledWith(
      "/api/admin/attributes/2",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify(attributePayload())
      })
    );
  });

  it("throws normalized backend errors", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "options must be a JSON array"
          }
        },
        400
      )
    );

    await expect(createAttribute(attributePayload())).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "options must be a JSON array"
    } satisfies Partial<AttributeApiError>);
  });
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function attributePayload() {
  return {
    categoryId: 7,
    code: "tank_capacity",
    defaultLabel: "Tank Capacity",
    dataType: "number" as const,
    unit: "L",
    options: [],
    validationRules: { min: 1000, max: 50000 },
    uiConfig: { widget: "number" },
    required: true,
    filterable: true,
    comparable: true,
    sortOrder: 10,
    status: "ACTIVE" as const
  };
}

function attributeData(id: number) {
  return {
    id,
    ...attributePayload(),
    options: "[]",
    validationRules: "{}",
    uiConfig: "{}"
  };
}
