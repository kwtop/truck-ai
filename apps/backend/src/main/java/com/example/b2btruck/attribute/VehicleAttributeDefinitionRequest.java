package com.example.b2btruck.attribute;

import com.fasterxml.jackson.databind.JsonNode;

public record VehicleAttributeDefinitionRequest(
        Long categoryId,
        String code,
        String defaultLabel,
        String dataType,
        String unit,
        JsonNode options,
        JsonNode validationRules,
        JsonNode uiConfig,
        Boolean required,
        Boolean filterable,
        Boolean comparable,
        Integer sortOrder,
        String status
) {
}
