import { describe, expect, it } from "vitest";

import { messageRoleColor, sessionLeadLabel, toolNames } from "./aiChatPresentation";

describe("aiChatPresentation", () => {
  it("formats lead labels", () => {
    expect(
      sessionLeadLabel({
        id: 1,
        sessionNo: "AI-1",
        visitorId: "visitor-1",
        locale: "en-US",
        sourcePage: "/products",
        leadId: 2,
        leadNo: "LEAD-1",
        leadName: "Maria",
        leadCountry: "Mexico",
        status: "ACTIVE",
        messageCount: 2,
        createdAt: "2026-05-09T00:00:00Z",
        lastMessageAt: "2026-05-09T00:00:00Z"
      })
    ).toBe("LEAD-1 / Maria / Mexico");
  });

  it("extracts tool names from payload", () => {
    expect(toolNames({ tools: [{ toolName: "search_products" }, { toolName: "create_sales_lead" }] })).toEqual([
      "search_products",
      "create_sales_lead"
    ]);
  });

  it("maps role colors", () => {
    expect(messageRoleColor("USER")).toBe("blue");
    expect(messageRoleColor("ASSISTANT")).toBe("green");
    expect(messageRoleColor("SYSTEM")).toBe("purple");
  });
});
