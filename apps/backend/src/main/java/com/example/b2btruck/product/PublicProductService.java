package com.example.b2btruck.product;

import com.example.b2btruck.category.VehicleCategory;
import com.example.b2btruck.category.VehicleCategoryRepository;
import com.example.b2btruck.common.api.PageResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class PublicProductService {

    private static final String PUBLISHED_STATUS = "PUBLISHED";
    private static final int DEFAULT_PAGE = 1;
    private static final int DEFAULT_PAGE_SIZE = 12;
    private static final int MAX_PAGE_SIZE = 60;
    private static final Set<String> RESERVED_QUERY_PARAMS = Set.of(
            "locale",
            "category",
            "page",
            "pageSize",
            "keyword"
    );

    private final ProductRepository productRepository;
    private final ProductTranslationRepository translationRepository;
    private final VehicleCategoryRepository categoryRepository;
    private final ObjectMapper objectMapper;

    public PublicProductService(
            ProductRepository productRepository,
            ProductTranslationRepository translationRepository,
            VehicleCategoryRepository categoryRepository,
            ObjectMapper objectMapper
    ) {
        this.productRepository = productRepository;
        this.translationRepository = translationRepository;
        this.categoryRepository = categoryRepository;
        this.objectMapper = objectMapper;
    }

    public PageResponse<PublicProductListItemResponse> list(
            String locale,
            String category,
            String keyword,
            Integer page,
            Integer pageSize,
            Map<String, String> queryParams
    ) {
        int normalizedPage = normalizePage(page);
        int normalizedPageSize = normalizePageSize(pageSize);
        List<VehicleCategory> activeCategories = categoryRepository.findAll(null, "ACTIVE");
        Set<Long> allowedCategoryIds = resolveCategoryIds(category, activeCategories);
        Map<Long, VehicleCategory> categoriesById = activeCategories.stream()
                .collect(Collectors.toMap(VehicleCategory::id, Function.identity()));
        Map<String, String> specFilters = specFilters(queryParams);

        List<Product> matched = productRepository.findAll(null, keyword, PUBLISHED_STATUS)
                .stream()
                .filter(product -> allowedCategoryIds == null || allowedCategoryIds.contains(product.categoryId()))
                .filter(product -> categoriesById.containsKey(product.categoryId()))
                .filter(product -> matchesSpecFilters(product, specFilters))
                .toList();

        long total = matched.size();
        int fromIndex = Math.min((normalizedPage - 1) * normalizedPageSize, matched.size());
        int toIndex = Math.min(fromIndex + normalizedPageSize, matched.size());
        List<PublicProductListItemResponse> items = matched.subList(fromIndex, toIndex)
                .stream()
                .map(product -> toResponse(product, categoriesById.get(product.categoryId()), locale))
                .toList();

        return new PageResponse<>(items, normalizedPage, normalizedPageSize, total);
    }

    public PublicProductDetailResponse getBySlug(String slug, String locale) {
        if (isBlank(slug)) {
            throw new ProductNotFoundException(null);
        }

        Product product = productRepository.findBySlug(slug.trim())
                .filter(item -> PUBLISHED_STATUS.equals(item.status()))
                .orElseThrow(() -> new ProductNotFoundException(null));
        VehicleCategory category = categoryRepository.findById(product.categoryId())
                .filter(item -> "ACTIVE".equals(item.status()))
                .orElseThrow(() -> new ProductNotFoundException(product.id()));
        ProductTranslation translation = isBlank(locale)
                ? null
                : translationRepository.findByProductIdAndLocale(product.id(), locale.trim()).orElse(null);

        return PublicProductDetailResponse.from(product, category, translation, objectMapper);
    }

    private PublicProductListItemResponse toResponse(Product product, VehicleCategory category, String locale) {
        ProductTranslation translation = isBlank(locale)
                ? null
                : translationRepository.findByProductIdAndLocale(product.id(), locale.trim()).orElse(null);
        return PublicProductListItemResponse.from(product, category, translation, objectMapper);
    }

    private Set<Long> resolveCategoryIds(String category, List<VehicleCategory> activeCategories) {
        if (isBlank(category)) {
            return null;
        }

        String normalized = category.trim();
        Optional<VehicleCategory> root = activeCategories.stream()
                .filter(item -> String.valueOf(item.id()).equals(normalized)
                        || item.slug().equalsIgnoreCase(normalized)
                        || item.code().equalsIgnoreCase(normalized))
                .findFirst();
        if (root.isEmpty()) {
            return Set.of();
        }

        Map<Long, List<VehicleCategory>> childrenByParentId = activeCategories.stream()
                .filter(item -> item.parentId() != null)
                .collect(Collectors.groupingBy(VehicleCategory::parentId));
        Set<Long> ids = new LinkedHashSet<>();
        collectCategoryIds(root.get(), childrenByParentId, ids);
        return ids;
    }

    private void collectCategoryIds(
            VehicleCategory category,
            Map<Long, List<VehicleCategory>> childrenByParentId,
            Set<Long> ids
    ) {
        ids.add(category.id());
        for (VehicleCategory child : childrenByParentId.getOrDefault(category.id(), List.of())) {
            collectCategoryIds(child, childrenByParentId, ids);
        }
    }

    private boolean matchesSpecFilters(Product product, Map<String, String> specFilters) {
        if (specFilters.isEmpty()) {
            return true;
        }

        JsonNode specs = readSpecs(product);
        for (Map.Entry<String, String> entry : specFilters.entrySet()) {
            JsonNode value = specs.get(entry.getKey());
            if (value == null || value.isNull()) {
                return false;
            }
            if (value.isArray()) {
                boolean contains = false;
                for (JsonNode item : value) {
                    if (entry.getValue().equalsIgnoreCase(item.asText())) {
                        contains = true;
                        break;
                    }
                }
                if (!contains) {
                    return false;
                }
            } else if (!entry.getValue().equalsIgnoreCase(value.asText())) {
                return false;
            }
        }
        return true;
    }

    private JsonNode readSpecs(Product product) {
        try {
            JsonNode node = objectMapper.readTree(product.specs());
            if (node.isTextual()) {
                return objectMapper.readTree(node.asText());
            }
            return node;
        } catch (Exception exception) {
            return objectMapper.createObjectNode();
        }
    }

    private Map<String, String> specFilters(Map<String, String> queryParams) {
        if (queryParams == null || queryParams.isEmpty()) {
            return Map.of();
        }

        return queryParams.entrySet()
                .stream()
                .filter(entry -> !RESERVED_QUERY_PARAMS.contains(entry.getKey()))
                .filter(entry -> !isBlank(entry.getValue()))
                .collect(Collectors.toMap(Map.Entry::getKey, entry -> entry.getValue().trim()));
    }

    private int normalizePage(Integer page) {
        return page == null || page < 1 ? DEFAULT_PAGE : page;
    }

    private int normalizePageSize(Integer pageSize) {
        if (pageSize == null || pageSize < 1) {
            return DEFAULT_PAGE_SIZE;
        }
        return Math.min(pageSize, MAX_PAGE_SIZE);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
