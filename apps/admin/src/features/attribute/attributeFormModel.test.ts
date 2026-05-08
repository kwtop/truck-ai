import { describe, expect, it } from "vitest";
import {
  attributeToFormValues,
  defaultAttributeFormValues,
  formValuesToPayload,
  parseJsonArray,
  parseJsonObject
} from "./attributeFormModel";

describe("attributeFormModel", () => {
  it("builds default values for a selected category", () => {
    expect(defaultAttributeFormValues(9)).toMatchObject({
      categoryId: 9,
      dataType: "text",
      options: "[]",
      validationRules: "{}",
      status: "ACTIVE"
    });
  });

  it("maps API records into form values", () => {
    expect(
      attributeToFormValues({
        id: 1,
        categoryId: 9,
        code: "tank_capacity",
        defaultLabel: "Tank Capacity",
        dataType: "number",
        unit: "L",
        options: "[1000]",
        validationRules: "{\"min\":1000}",
        uiConfig: "{\"widget\":\"number\"}",
        required: true,
        filterable: true,
        comparable: false,
        sortOrder: 10,
        status: "ACTIVE"
      })
    ).toMatchObject({
      code: "tank_capacity",
      options: "[1000]",
      comparable: false
    });
  });

  it("parses JSON fields into API payload objects", () => {
    expect(
      formValuesToPayload({
        categoryId: 9,
        code: " tank_capacity ",
        defaultLabel: " Tank Capacity ",
        dataType: "number",
        unit: " L ",
        options: "[\"10000L\"]",
        validationRules: "{\"min\":1000}",
        uiConfig: "{\"widget\":\"number\"}",
        required: true,
        filterable: true,
        comparable: true,
        sortOrder: 10,
        status: "ACTIVE"
      })
    ).toEqual({
      categoryId: 9,
      code: "tank_capacity",
      defaultLabel: "Tank Capacity",
      dataType: "number",
      unit: "L",
      options: ["10000L"],
      validationRules: { min: 1000 },
      uiConfig: { widget: "number" },
      required: true,
      filterable: true,
      comparable: true,
      sortOrder: 10,
      status: "ACTIVE"
    });
  });

  it("rejects JSON with the wrong shape", () => {
    expect(() => parseJsonArray("{}", "Options")).toThrow("Options must be a JSON array");
    expect(() => parseJsonObject("[]", "Validation rules")).toThrow(
      "Validation rules must be a JSON object"
    );
    expect(() => parseJsonObject("{", "UI config")).toThrow("UI config must be valid JSON");
  });
});
