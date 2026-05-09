import type { AiChatMessage, AiChatSessionSummary } from "./aiChatApi";

export function sessionLeadLabel(session: AiChatSessionSummary) {
  if (!session.leadId) {
    return "No lead";
  }
  return [session.leadNo, session.leadName, session.leadCountry].filter(Boolean).join(" / ");
}

export function messageRoleColor(role: AiChatMessage["role"]) {
  switch (role) {
    case "USER":
      return "blue";
    case "ASSISTANT":
      return "green";
    case "SYSTEM":
      return "purple";
    default:
      return "default";
  }
}

export function toolNames(payload: Record<string, unknown>) {
  const tools = payload.tools;
  if (!Array.isArray(tools)) {
    return [];
  }
  return tools
    .map((tool) => {
      if (!tool || typeof tool !== "object" || !("toolName" in tool)) {
        return "";
      }
      const value = (tool as { toolName?: unknown }).toolName;
      return typeof value === "string" ? value : "";
    })
    .filter(Boolean);
}
