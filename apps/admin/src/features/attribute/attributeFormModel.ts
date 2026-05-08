import type { AttributePayload, AttributeStatus, VehicleAttributeDefinition } from "./attributeApi";

export type AttributeFormValues = {
  categoryId: number;
  code: string;
  defaultLabel: string;
  dataType: AttributePayload["dataType"];
  unit: string;
  options: string;
  validationRules: string;
  uiConfig: string;
  required: boolean;
  filterable: boolean;
  comparable: boolean;
  sortOrder: number;
  status: AttributeStatus;
};

export function defaultAttributeFormValues(categoryId: number): AttributeFormValues {
  return {
    categoryId,
    code: "",
    defaultLabel: "",
    dataType: "text",
    unit: "",
    options: "[]",
    validationRules: "{}",
    uiConfig: "{}",
    required: false,
    filterable: false,
    comparable: false,
    sortOrder: 0,
    status: "ACTIVE"
  };
}

export function attributeToFormValues(attribute: VehicleAttributeDefinition): AttributeFormValues {
  return {
    categoryId: attribute.categoryId,
    code: attribute.code,
    defaultLabel: attribute.defaultLabel,
    dataType: attribute.dataType,
    unit: attribute.unit ?? "",
    options: attribute.options || "[]",
    validationRules: attribute.validationRules || "{}",
    uiConfig: attribute.uiConfig || "{}",
    required: attribute.required,
    filterable: attribute.filterable,
    comparable: attribute.comparable,
    sortOrder: attribute.sortOrder,
    status: attribute.status
  };
}

export function formValuesToPayload(values: AttributeFormValues): AttributePayload {
  return {
    categoryId: values.categoryId,
    code: values.code.trim(),
    defaultLabel: values.defaultLabel.trim(),
    dataType: values.dataType,
    unit: values.unit?.trim() ?? "",
    options: parseJsonArray(values.options, "Options"),
    validationRules: parseJsonObject(values.validationRules, "Validation rules"),
    uiConfig: parseJsonObject(values.uiConfig, "UI config"),
    required: Boolean(values.required),
    filterable: Boolean(values.filterable),
    comparable: Boolean(values.comparable),
    sortOrder: values.sortOrder ?? 0,
    status: values.status
  };
}

export function parseJsonArray(value: string, label: string): unknown[] {
  const parsed = parseJson(value || "[]", label);
  if (!Array.isArray(parsed)) {
    throw new Error(`${label} must be a JSON array`);
  }
  return parsed;
}

export function parseJsonObject(value: string, label: string): Record<string, unknown> {
  const parsed = parseJson(value || "{}", label);
  if (parsed === null || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new Error(`${label} must be a JSON object`);
  }
  return parsed as Record<string, unknown>;
}

function parseJson(value: string, label: string) {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`${label} must be valid JSON`);
  }
}
