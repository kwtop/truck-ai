package com.example.b2btruck.attribute;

import java.time.OffsetDateTime;

public record VehicleAttributeDefinition(
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
        String status,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
