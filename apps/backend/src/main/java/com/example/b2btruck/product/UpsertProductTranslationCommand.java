package com.example.b2btruck.product;

public record UpsertProductTranslationCommand(
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
        String ogImage
) {
}
