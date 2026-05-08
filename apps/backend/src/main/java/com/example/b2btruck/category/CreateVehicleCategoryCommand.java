package com.example.b2btruck.category;

public record CreateVehicleCategoryCommand(
        Long parentId,
        String code,
        String slug,
        String defaultName,
        String defaultDescription,
        String status,
        int sortOrder,
        String seoConfig,
        String displayConfig
) {
}
