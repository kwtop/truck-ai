package com.example.b2btruck.product;

import com.fasterxml.jackson.databind.JsonNode;

public record ProductRequest(
        Long categoryId,
        String sku,
        String slug,
        String defaultName,
        String defaultSummary,
        String status,
        JsonNode specs,
        JsonNode seoConfig,
        JsonNode shippingConfig,
        Boolean aiEnabled,
        Boolean featured,
        Integer sortOrder
) {
}
