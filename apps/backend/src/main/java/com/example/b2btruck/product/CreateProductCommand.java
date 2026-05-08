package com.example.b2btruck.product;

public record CreateProductCommand(
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
        Long createdBy
) {
}
