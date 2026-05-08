package com.example.b2btruck.attribute;

public record CreateVehicleAttributeDefinitionCommand(
        Long categoryId,
        String code,
        String defaultLabel,
        String dataType,
        String unit,
        String options,
        String validationRules,
        String uiConfig,
        boolean required,
        boolean filterable,
        boolean comparable,
        int sortOrder,
        String status
) {
}
