package com.example.b2btruck.product;

import com.fasterxml.jackson.databind.JsonNode;

public record ProductTranslationRequest(
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
        String ogImage
) {
}
