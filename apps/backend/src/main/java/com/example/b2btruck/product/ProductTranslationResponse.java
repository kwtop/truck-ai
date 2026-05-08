package com.example.b2btruck.product;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;

public record ProductTranslationResponse(
        Long id,
        Long productId,
        String locale,
        String name,
        String summary,
        String description,
        String applications,
        JsonNode localizedSpecs,
        String seoTitle,
        String seoDescription,
        String seoKeywords,
        String canonicalUrl,
        String ogTitle,
        String ogDescription,
        String ogImage,
        boolean fallback,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {

    static ProductTranslationResponse from(ProductTranslation translation, ObjectMapper objectMapper) {
        return new ProductTranslationResponse(
                translation.id(),
                translation.productId(),
                translation.locale(),
                translation.name(),
                translation.summary(),
                translation.description(),
                translation.applications(),
                readJson(translation.localizedSpecs(), objectMapper),
                translation.seoTitle(),
                translation.seoDescription(),
                translation.seoKeywords(),
                translation.canonicalUrl(),
                translation.ogTitle(),
                translation.ogDescription(),
                translation.ogImage(),
                false,
                translation.createdAt(),
                translation.updatedAt()
        );
    }

    static ProductTranslationResponse fallbackFrom(Product product, String locale, ObjectMapper objectMapper) {
        JsonNode seoConfig = readJson(product.seoConfig(), objectMapper);
        return new ProductTranslationResponse(
                null,
                product.id(),
                locale,
                product.defaultName(),
                product.defaultSummary(),
                null,
                null,
                objectMapper.createObjectNode(),
                textOrNull(seoConfig, "title"),
                textOrNull(seoConfig, "description"),
                textOrNull(seoConfig, "keywords"),
                textOrNull(seoConfig, "canonicalUrl"),
                textOrNull(seoConfig, "ogTitle"),
                textOrNull(seoConfig, "ogDescription"),
                textOrNull(seoConfig, "ogImage"),
                true,
                product.createdAt(),
                product.updatedAt()
        );
    }

    private static JsonNode readJson(String value, ObjectMapper objectMapper) {
        try {
            return value == null || value.isBlank() ? objectMapper.createObjectNode() : objectMapper.readTree(value);
        } catch (Exception exception) {
            return objectMapper.createObjectNode();
        }
    }

    private static String textOrNull(JsonNode node, String fieldName) {
        JsonNode value = node == null ? null : node.get(fieldName);
        return value == null || value.isNull() ? null : value.asText();
    }
}
