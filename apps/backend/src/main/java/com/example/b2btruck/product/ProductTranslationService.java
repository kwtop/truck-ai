package com.example.b2btruck.product;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ProductTranslationService {

    private final ProductRepository productRepository;
    private final ProductTranslationRepository translationRepository;
    private final ObjectMapper objectMapper;

    public ProductTranslationService(
            ProductRepository productRepository,
            ProductTranslationRepository translationRepository,
            ObjectMapper objectMapper
    ) {
        this.productRepository = productRepository;
        this.translationRepository = translationRepository;
        this.objectMapper = objectMapper;
    }

    public List<ProductTranslationResponse> list(Long productId) {
        ensureProductExists(productId);
        return translationRepository.findByProductId(productId)
                .stream()
                .map(translation -> ProductTranslationResponse.from(translation, objectMapper))
                .toList();
    }

    public ProductTranslationResponse get(Long productId, String locale) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));
        String normalizedLocale = normalizeLocale(locale);

        return translationRepository.findByProductIdAndLocale(productId, normalizedLocale)
                .map(translation -> ProductTranslationResponse.from(translation, objectMapper))
                .orElseGet(() -> ProductTranslationResponse.fallbackFrom(product, normalizedLocale, objectMapper));
    }

    public ProductTranslationResponse upsert(Long productId, String locale, ProductTranslationRequest request) {
        ensureProductExists(productId);
        String normalizedLocale = normalizeLocale(locale);
        ValidatedTranslationRequest validated = validateRequest(request);

        ProductTranslation translation = translationRepository.upsert(new UpsertProductTranslationCommand(
                productId,
                normalizedLocale,
                validated.name(),
                validated.summary(),
                validated.description(),
                validated.applications(),
                validated.localizedSpecs(),
                validated.seoTitle(),
                validated.seoDescription(),
                validated.seoKeywords(),
                validated.canonicalUrl(),
                validated.ogTitle(),
                validated.ogDescription(),
                validated.ogImage()
        ));

        return ProductTranslationResponse.from(translation, objectMapper);
    }

    private void ensureProductExists(Long productId) {
        if (productId == null || productRepository.findById(productId).isEmpty()) {
            throw new ProductNotFoundException(productId);
        }
    }

    private ValidatedTranslationRequest validateRequest(ProductTranslationRequest request) {
        if (request == null || isBlank(request.name())) {
            throw new IllegalArgumentException("name is required");
        }

        return new ValidatedTranslationRequest(
                request.name().trim(),
                trimOrNull(request.summary()),
                trimOrNull(request.description()),
                trimOrNull(request.applications()),
                writeJsonObject(request.localizedSpecs(), "localizedSpecs"),
                trimOrNull(request.seoTitle()),
                trimOrNull(request.seoDescription()),
                trimOrNull(request.seoKeywords()),
                trimOrNull(request.canonicalUrl()),
                trimOrNull(request.ogTitle()),
                trimOrNull(request.ogDescription()),
                trimOrNull(request.ogImage())
        );
    }

    private String normalizeLocale(String locale) {
        if (isBlank(locale)) {
            throw new IllegalArgumentException("locale is required");
        }
        return locale.trim();
    }

    private String writeJsonObject(JsonNode node, String fieldName) {
        if (node == null || node.isNull()) {
            return "{}";
        }
        if (!node.isObject()) {
            throw new IllegalArgumentException(fieldName + " must be a JSON object");
        }
        try {
            return objectMapper.writeValueAsString(node);
        } catch (Exception exception) {
            throw new IllegalArgumentException(fieldName + " must be valid JSON");
        }
    }

    private String trimOrNull(String value) {
        return isBlank(value) ? null : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private record ValidatedTranslationRequest(
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
}
