package com.example.b2btruck.category;

public record VehicleCategoryRequest(
        Long parentId,
        String code,
        String slug,
        String defaultName,
        String defaultDescription,
        String status,
        Integer sortOrder,
        String seoConfig,
        String displayConfig
) {
}
