package com.example.b2btruck.product;

import com.example.b2btruck.auth.AuthenticatedUser;
import com.example.b2btruck.category.VehicleCategoryRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Set;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    private static final String DEFAULT_STATUS = "DRAFT";
    private static final Set<String> ALLOWED_STATUSES = Set.of("DRAFT", "PUBLISHED", "OFFLINE");

    private final ProductRepository productRepository;
    private final VehicleCategoryRepository categoryRepository;
    private final ProductSpecValidator specValidator;
    private final ObjectMapper objectMapper;

    public ProductService(
            ProductRepository productRepository,
            VehicleCategoryRepository categoryRepository,
            ProductSpecValidator specValidator,
            ObjectMapper objectMapper
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.specValidator = specValidator;
        this.objectMapper = objectMapper;
    }

    public List<ProductResponse> list(Long categoryId, String keyword, String status) {
        return productRepository.findAll(categoryId, keyword, status)
                .stream()
                .map(product -> ProductResponse.from(product, objectMapper))
                .toList();
    }

    public ProductResponse get(Long id) {
        Product product = productRepository.findById(id).orElseThrow(() -> new ProductNotFoundException(id));
        return ProductResponse.from(product, objectMapper);
    }

    public ProductResponse create(ProductRequest request, Authentication authentication) {
        ValidatedProductRequest validated = validateRequest(request);
        Product product = productRepository.save(new CreateProductCommand(
                validated.categoryId(),
                validated.sku(),
                validated.slug(),
                validated.defaultName(),
                validated.defaultSummary(),
                validated.status(),
                validated.specs(),
                validated.seoConfig(),
                validated.shippingConfig(),
                validated.aiEnabled(),
                validated.featured(),
                validated.sortOrder(),
                currentUserId(authentication)
        ));

        return ProductResponse.from(product, objectMapper);
    }

    public ProductResponse update(Long id, ProductRequest request, Authentication authentication) {
        ValidatedProductRequest validated = validateRequest(request);
        Product product = productRepository.update(id, new UpdateProductCommand(
                validated.categoryId(),
                validated.sku(),
                validated.slug(),
                validated.defaultName(),
                validated.defaultSummary(),
                validated.status(),
                validated.specs(),
                validated.seoConfig(),
                validated.shippingConfig(),
                validated.aiEnabled(),
                validated.featured(),
                validated.sortOrder(),
                currentUserId(authentication)
        ));

        return ProductResponse.from(product, objectMapper);
    }

    public void delete(Long id, Authentication authentication) {
        productRepository.delete(id, currentUserId(authentication));
    }

    private ValidatedProductRequest validateRequest(ProductRequest request) {
        if (request == null || request.categoryId() == null || isBlank(request.slug()) || isBlank(request.defaultName())) {
            throw new IllegalArgumentException("categoryId, slug and defaultName are required");
        }
        if (categoryRepository.findById(request.categoryId()).isEmpty()) {
            throw new IllegalArgumentException("categoryId does not reference an existing category");
        }

        String status = isBlank(request.status()) ? DEFAULT_STATUS : request.status().trim();
        if (!ALLOWED_STATUSES.contains(status)) {
            throw new IllegalArgumentException("Unsupported product status: " + status);
        }

        JsonNode specs = request.specs() == null || request.specs().isNull()
                ? objectMapper.createObjectNode()
                : request.specs();
        specValidator.validate(request.categoryId(), specs);

        return new ValidatedProductRequest(
                request.categoryId(),
                isBlank(request.sku()) ? null : request.sku().trim(),
                request.slug().trim(),
                request.defaultName().trim(),
                isBlank(request.defaultSummary()) ? null : request.defaultSummary().trim(),
                status,
                writeJsonObject(specs, "specs"),
                writeJsonObject(request.seoConfig(), "seoConfig"),
                writeJsonObject(request.shippingConfig(), "shippingConfig"),
                !Boolean.FALSE.equals(request.aiEnabled()),
                Boolean.TRUE.equals(request.featured()),
                request.sortOrder() == null ? 0 : request.sortOrder()
        );
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

    private Long currentUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser user) {
            return user.id();
        }
        return null;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private record ValidatedProductRequest(
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
            int sortOrder
    ) {
    }
}
