package com.example.b2btruck.attribute;

public record VehicleAttributeDefinitionResponse(
        Long id,
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

    static VehicleAttributeDefinitionResponse from(VehicleAttributeDefinition definition) {
        return new VehicleAttributeDefinitionResponse(
                definition.id(),
                definition.categoryId(),
                definition.code(),
                definition.defaultLabel(),
                definition.dataType(),
                definition.unit(),
                definition.options(),
                definition.validationRules(),
                definition.uiConfig(),
                definition.required(),
                definition.filterable(),
                definition.comparable(),
                definition.sortOrder(),
                definition.status()
        );
    }
}
