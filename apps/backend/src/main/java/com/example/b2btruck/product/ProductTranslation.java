package com.example.b2btruck.product;

import java.time.OffsetDateTime;

public record ProductTranslation(
        Long id,
        Long productId,
        String locale,
        String name,
        String summary,
        String description,
        String applications,
        String localizedSpecs,
        String seoTitle,
        String seoDescription,
        String seoKeywords,
        String canonicalUrl,
        String ogTitle,
        String ogDescription,
        String ogImage,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
