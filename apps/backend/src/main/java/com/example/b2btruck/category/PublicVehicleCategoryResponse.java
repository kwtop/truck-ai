package com.example.b2btruck.category;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;

public record PublicVehicleCategoryResponse(
        Long id,
        Long parentId,
        String code,
        String slug,
        String defaultName,
        String defaultDescription,
        int sortOrder,
        JsonNode seoConfig,
        JsonNode displayConfig,
        List<PublicVehicleCategoryResponse> children
) {

    static PublicVehicleCategoryResponse from(
            VehicleCategory category,
            JsonNode seoConfig,
            JsonNode displayConfig,
            List<PublicVehicleCategoryResponse> children
    ) {
        return new PublicVehicleCategoryResponse(
                category.id(),
                category.parentId(),
                category.code(),
                category.slug(),
                category.defaultName(),
                category.defaultDescription(),
                category.sortOrder(),
                seoConfig,
                displayConfig,
                children
        );
    }
}
