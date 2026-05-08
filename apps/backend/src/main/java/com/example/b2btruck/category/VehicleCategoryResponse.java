package com.example.b2btruck.category;

import java.util.List;

public record VehicleCategoryResponse(
        Long id,
        Long parentId,
        String code,
        String slug,
        String defaultName,
        String defaultDescription,
        String status,
        int sortOrder,
        String seoConfig,
        String displayConfig,
        List<VehicleCategoryResponse> children
) {
    static VehicleCategoryResponse from(VehicleCategory category) {
        return from(category, List.of());
    }

    static VehicleCategoryResponse from(VehicleCategory category, List<VehicleCategoryResponse> children) {
        return new VehicleCategoryResponse(
                category.id(),
                category.parentId(),
                category.code(),
                category.slug(),
                category.defaultName(),
                category.defaultDescription(),
                category.status(),
                category.sortOrder(),
                category.seoConfig(),
                category.displayConfig(),
                children
        );
    }
}
