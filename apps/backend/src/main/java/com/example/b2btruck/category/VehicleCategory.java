package com.example.b2btruck.category;

import java.time.OffsetDateTime;

public record VehicleCategory(
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
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
