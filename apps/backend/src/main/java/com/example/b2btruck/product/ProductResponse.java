package com.example.b2btruck.product;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;

public record ProductResponse(
        Long id,
        Long categoryId,
        String sku,
        String slug,
        String defaultName,
        String defaultSummary,
        String status,
        JsonNode specs,
        JsonNode seoConfig,
        JsonNode shippingConfig,
        boolean aiEnabled,
        boolean featured,
        int sortOrder,
        OffsetDateTime publishedAt,
        Long createdBy,
        Long updatedBy,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {

    static ProductResponse from(Product product, ObjectMapper objectMapper) {
        return new ProductResponse(
                product.id(),
                product.categoryId(),
                product.sku(),
                product.slug(),
                product.defaultName(),
                product.defaultSummary(),
                product.status(),
                readJson(product.specs(), objectMapper),
                readJson(product.seoConfig(), objectMapper),
                readJson(product.shippingConfig(), objectMapper),
                product.aiEnabled(),
                product.featured(),
                product.sortOrder(),
                product.publishedAt(),
                product.createdBy(),
                product.updatedBy(),
                product.createdAt(),
                product.updatedAt()
        );
    }

    private static JsonNode readJson(String json, ObjectMapper objectMapper) {
        try {
            JsonNode node = objectMapper.readTree(json == null || json.isBlank() ? "{}" : json);
            if (node.isTextual()) {
                return readJson(node.asText(), objectMapper);
            }
            return node;
        } catch (Exception exception) {
            return objectMapper.createObjectNode();
        }
    }
}
