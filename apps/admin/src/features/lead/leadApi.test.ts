import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/stores/authStore";
import { LeadApiError, addLeadFollowUp, assignLead, exportLeads, listLeads, updateLeadStatus } from "./leadApi";

describe("leadApi", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    useAuthStore.setState({
      token: "jwt-token",
      tokenType: "Bearer",
      permissions: ["lead:read", "lead:write", "lead:assign"],
      isAuthenticated: true
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    useAuthStore.getState().logout();
  });

  it("loads leads with filters and authorization", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ success: true, data: { items: [leadData()], page: 1, pageSize: 20, total: 1 } }));

    const page = await listLeads({ status: "NEW", country: "Mexico", assignedTo: 7, keyword: "fuel", page: 1, pageSize: 20 });

    expect(fetch).toHaveBeenCalledWith(
      "/api/admin/leads?status=NEW&country=Mexico&assignedTo=7&keyword=fuel&page=1&pageSize=20",
      expect.objectContaining({})
    );
    const init = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer jwt-token");
    expect(page.items[0].leadNo).toBe("LEAD-20260509-0001");
  });

  it("assigns status and follow-up payloads", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { ...leadData(), assignedTo: 9 } }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { ...leadData(), status: "QUOTED", quoted: true } }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: followUpData() }));

    await expect(assignLead(1, 9)).resolves.toMatchObject({ assignedTo: 9 });
    await expect(updateLeadStatus(1, "QUOTED", { quoted: true })).resolves.toMatchObject({ status: "QUOTED" });
    await expect(addLeadFollowUp(1, { followType: "EMAIL", content: "Sent quote" })).resolves.toMatchObject({ followType: "EMAIL" });
  });

  it("exports leads as blob", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response("leadNo\nLEAD-1\n", { status: 200, headers: { "Content-Type": "text/csv" } }));

    const blob = await exportLeads({ country: "Mexico" });

    expect(blob.type).toBe("text/csv");
    expect(fetch).toHaveBeenCalledWith("/api/admin/leads/export?country=Mexico", expect.objectContaining({}));
  });

  it("throws normalized backend errors", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ success: false, error: { code: "AUTH_FORBIDDEN", message: "Forbidden" } }, 403));

    await expect(listLeads()).rejects.toMatchObject({
      code: "AUTH_FORBIDDEN",
      message: "Forbidden"
    } satisfies Partial<LeadApiError>);
  });
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function leadData() {
  return {
    id: 1,
    leadNo: "LEAD-20260509-0001",
    name: "Maria Lopez",
    companyName: "North Cargo",
    country: "Mexico",
    email: "maria@example.com",
    whatsapp: "+52",
    interestedProductId: 3,
    interestedProductSlug: "fuel-truck",
    interestedProductName: "Fuel Truck",
    vehicleType: "Fuel Tank Truck",
    quantity: 2,
    message: "Need quote",
    status: "NEW",
    assignedTo: null,
    quoted: false,
    won: false,
    requirementDetails: {},
    sourceContext: {},
    aiSummary: null,
    createdAt: "2026-05-09T00:00:00Z",
    updatedAt: "2026-05-09T00:00:00Z"
  };
}

function followUpData() {
  return {
    id: 1,
    leadId: 1,
    followType: "EMAIL",
    content: "Sent quote",
    nextActionAt: null,
    attachments: [],
    createdBy: 7,
    createdAt: "2026-05-09T00:00:00Z"
  };
}
