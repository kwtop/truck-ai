package com.example.b2btruck.product;

import java.time.OffsetDateTime;

public record Product(
        Long id,
        Long categoryId,
        String sku,
        String slug,
        String defaultName,
        String defaultSummary,
        String status,
        String specs,
        String seoConfig,
        String shippingConfig,
        boolean aiEnabled,
        boolean featured,
        int sortOrder,
        OffsetDateTime publishedAt,
        Long createdBy,
        Long updatedBy,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
