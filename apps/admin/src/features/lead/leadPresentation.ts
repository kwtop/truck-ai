import type { AdminLead, LeadStatus } from "./leadApi";

export const leadStatusOptions: Array<{ label: string; value: LeadStatus | "ALL" }> = [
  { label: "All statuses", value: "ALL" },
  { label: "New", value: "NEW" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Qualified", value: "QUALIFIED" },
  { label: "Quoted", value: "QUOTED" },
  { label: "Won", value: "WON" },
  { label: "Lost", value: "LOST" }
];

export function statusColor(status: LeadStatus) {
  const colors: Record<LeadStatus, string> = {
    NEW: "blue",
    CONTACTED: "cyan",
    QUALIFIED: "purple",
    QUOTED: "gold",
    WON: "green",
    LOST: "red"
  };
  return colors[status];
}

export function contactSummary(lead: Pick<AdminLead, "email" | "whatsapp">) {
  return [lead.email, lead.whatsapp].filter(Boolean).join(" / ") || "-";
}

export function sourceSummary(sourceContext: Record<string, unknown>) {
  const page = stringValue(sourceContext.sourcePage);
  const type = stringValue(sourceContext.sourceType);
  const campaign = stringValue(sourceContext.campaign ?? sourceContext.utmCampaign);
  return [page, type, campaign].filter(Boolean).join(" / ") || "-";
}

export function requirementRows(requirementDetails: Record<string, unknown>) {
  return Object.entries(requirementDetails)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => ({
      key,
      label: humanize(key),
      value: formatValue(value)
    }));
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(formatValue).join(", ");
  }
  if (typeof value === "object" && value !== null) {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${humanize(key)}: ${formatValue(item)}`)
      .join("; ");
  }
  return String(value);
}

function humanize(value: string) {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
