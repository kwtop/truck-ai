import { describe, expect, it } from "vitest";
import { contactSummary, requirementRows, sourceSummary, statusColor } from "./leadPresentation";

describe("leadPresentation", () => {
  it("formats status colors and contact/source summaries", () => {
    expect(statusColor("NEW")).toBe("blue");
    expect(statusColor("WON")).toBe("green");
    expect(contactSummary({ email: "sales@example.com", whatsapp: "+52" })).toBe("sales@example.com / +52");
    expect(sourceSummary({ sourcePage: "/contact", sourceType: "product", campaign: "hero" })).toBe("/contact / product / hero");
  });

  it("flattens requirement details", () => {
    expect(requirementRows({ capacityLiters: 10000, chassis: "Sinotruk" })).toEqual([
      { key: "capacityLiters", label: "CapacityLiters", value: "10000" },
      { key: "chassis", label: "Chassis", value: "Sinotruk" }
    ]);
  });
});
