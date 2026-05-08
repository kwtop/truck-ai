package com.example.b2btruck.product;

import com.example.b2btruck.category.VehicleCategory;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.util.List;

public record PublicProductDetailResponse(
        Long id,
        String sku,
        String slug,
        String name,
        String summary,
        String description,
        String applications,
        Long categoryId,
        String categorySlug,
        String categoryName,
        JsonNode specs,
        JsonNode localizedSpecs,
        JsonNode seo,
        JsonNode shippingConfig,
        boolean featured,
        OffsetDateTime publishedAt,
        List<Object> media,
        List<Object> buttons
) {

    static PublicProductDetailResponse from(
            Product product,
            VehicleCategory category,
            ProductTranslation translation,
            ObjectMapper objectMapper
    ) {
        JsonNode defaultSeo = readJson(product.seoConfig(), objectMapper);
        return new PublicProductDetailResponse(
                product.id(),
                product.sku(),
                product.slug(),
                translation == null ? product.defaultName() : translation.name(),
                translation == null ? product.defaultSummary() : firstNonBlank(translation.summary(), product.defaultSummary()),
                translation == null ? null : translation.description(),
                translation == null ? null : translation.applications(),
                product.categoryId(),
                category.slug(),
                category.defaultName(),
                readJson(product.specs(), objectMapper),
                translation == null ? objectMapper.createObjectNode() : readJson(translation.localizedSpecs(), objectMapper),
                translation == null ? defaultSeo : localizedSeo(translation, defaultSeo, objectMapper),
                readJson(product.shippingConfig(), objectMapper),
                product.featured(),
                product.publishedAt(),
                List.of(),
                List.of()
        );
    }

    private static JsonNode localizedSeo(
            ProductTranslation translation,
            JsonNode defaultSeo,
            ObjectMapper objectMapper
    ) {
        var seo = objectMapper.createObjectNode();
        copyText(seo, "title", firstNonBlank(translation.seoTitle(), textOrNull(defaultSeo, "title")));
        copyText(seo, "description", firstNonBlank(translation.seoDescription(), textOrNull(defaultSeo, "description")));
        copyText(seo, "keywords", firstNonBlank(translation.seoKeywords(), textOrNull(defaultSeo, "keywords")));
        copyText(seo, "canonicalUrl", firstNonBlank(translation.canonicalUrl(), textOrNull(defaultSeo, "canonicalUrl")));
        copyText(seo, "ogTitle", firstNonBlank(translation.ogTitle(), textOrNull(defaultSeo, "ogTitle")));
        copyText(seo, "ogDescription", firstNonBlank(translation.ogDescription(), textOrNull(defaultSeo, "ogDescription")));
        copyText(seo, "ogImage", firstNonBlank(translation.ogImage(), textOrNull(defaultSeo, "ogImage")));
        return seo;
    }

    private static void copyText(com.fasterxml.jackson.databind.node.ObjectNode node, String fieldName, String value) {
        if (value != null && !value.isBlank()) {
            node.put(fieldName, value);
        }
    }

    private static String firstNonBlank(String first, String fallback) {
        return first == null || first.isBlank() ? fallback : first;
    }

    private static String textOrNull(JsonNode node, String fieldName) {
        JsonNode value = node == null ? null : node.get(fieldName);
        return value == null || value.isNull() ? null : value.asText();
    }

    private static JsonNode readJson(String value, ObjectMapper objectMapper) {
        try {
            if (value == null || value.isBlank()) {
                return objectMapper.createObjectNode();
            }
            JsonNode node = objectMapper.readTree(value);
            if (node.isTextual()) {
                return readJson(node.asText(), objectMapper);
            }
            return node;
        } catch (Exception exception) {
            return objectMapper.createObjectNode();
        }
    }
}
