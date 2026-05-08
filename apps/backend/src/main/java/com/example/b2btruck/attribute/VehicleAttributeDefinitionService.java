package com.example.b2btruck.attribute;

import com.example.b2btruck.category.VehicleCategoryRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class VehicleAttributeDefinitionService {

    private static final String DEFAULT_STATUS = "ACTIVE";
    private static final Set<String> ALLOWED_DATA_TYPES = Set.of(
            "number",
            "text",
            "select",
            "multi_select",
            "boolean",
            "range"
    );
    private static final Set<String> ALLOWED_STATUSES = Set.of("ACTIVE", "DISABLED");

    private final VehicleAttributeDefinitionRepository attributeRepository;
    private final VehicleCategoryRepository categoryRepository;
    private final ObjectMapper objectMapper;

    public VehicleAttributeDefinitionService(
            VehicleAttributeDefinitionRepository attributeRepository,
            VehicleCategoryRepository categoryRepository,
            ObjectMapper objectMapper
    ) {
        this.attributeRepository = attributeRepository;
        this.categoryRepository = categoryRepository;
        this.objectMapper = objectMapper;
    }

    public List<VehicleAttributeDefinitionResponse> listByCategoryId(Long categoryId) {
        if (categoryId == null) {
            throw new IllegalArgumentException("categoryId is required");
        }
        ensureCategoryExists(categoryId);

        return attributeRepository.findByCategoryId(categoryId)
                .stream()
                .map(VehicleAttributeDefinitionResponse::from)
                .toList();
    }

    public VehicleAttributeDefinitionResponse create(VehicleAttributeDefinitionRequest request) {
        ValidatedAttributeRequest validated = validateRequest(request);
        VehicleAttributeDefinition definition = attributeRepository.save(new CreateVehicleAttributeDefinitionCommand(
                validated.categoryId(),
                validated.code(),
                validated.defaultLabel(),
                validated.dataType(),
                validated.unit(),
                validated.options(),
                validated.validationRules(),
                validated.uiConfig(),
                validated.required(),
                validated.filterable(),
                validated.comparable(),
                validated.sortOrder(),
                validated.status()
        ));

        return VehicleAttributeDefinitionResponse.from(definition);
    }

    public VehicleAttributeDefinitionResponse update(Long id, VehicleAttributeDefinitionRequest request) {
        ValidatedAttributeRequest validated = validateRequest(request);
        VehicleAttributeDefinition definition = attributeRepository.update(
                id,
                new UpdateVehicleAttributeDefinitionCommand(
                        validated.categoryId(),
                        validated.code(),
                        validated.defaultLabel(),
                        validated.dataType(),
                        validated.unit(),
                        validated.options(),
                        validated.validationRules(),
                        validated.uiConfig(),
                        validated.required(),
                        validated.filterable(),
                        validated.comparable(),
                        validated.sortOrder(),
                        validated.status()
                )
        );

        return VehicleAttributeDefinitionResponse.from(definition);
    }

    private ValidatedAttributeRequest validateRequest(VehicleAttributeDefinitionRequest request) {
        if (request == null || request.categoryId() == null || isBlank(request.code())
                || isBlank(request.defaultLabel()) || isBlank(request.dataType())) {
            throw new IllegalArgumentException("categoryId, code, defaultLabel and dataType are required");
        }

        ensureCategoryExists(request.categoryId());

        String dataType = request.dataType().trim();
        if (!ALLOWED_DATA_TYPES.contains(dataType)) {
            throw new IllegalArgumentException("Unsupported dataType: " + dataType);
        }

        String status = normalizeStatus(request.status());
        if (!ALLOWED_STATUSES.contains(status)) {
            throw new IllegalArgumentException("Unsupported status: " + status);
        }

        String options = normalizeJsonArray(request.options(), "options");
        String validationRules = normalizeJsonObject(request.validationRules(), "validationRules");
        String uiConfig = normalizeJsonObject(request.uiConfig(), "uiConfig");

        return new ValidatedAttributeRequest(
                request.categoryId(),
                request.code().trim(),
                request.defaultLabel().trim(),
                dataType,
                isBlank(request.unit()) ? null : request.unit().trim(),
                options,
                validationRules,
                uiConfig,
                Boolean.TRUE.equals(request.required()),
                Boolean.TRUE.equals(request.filterable()),
                Boolean.TRUE.equals(request.comparable()),
                request.sortOrder() == null ? 0 : request.sortOrder(),
                status
        );
    }

    private void ensureCategoryExists(Long categoryId) {
        if (categoryRepository.findById(categoryId).isEmpty()) {
            throw new IllegalArgumentException("categoryId does not reference an existing category");
        }
    }

    private String normalizeStatus(String status) {
        return isBlank(status) ? DEFAULT_STATUS : status.trim();
    }

    private String normalizeJsonArray(JsonNode value, String fieldName) {
        if (value == null || value.isNull()) {
            return "[]";
        }

        JsonNode node = normalizeJsonNode(value, fieldName);
        if (!node.isArray()) {
            throw new IllegalArgumentException(fieldName + " must be a JSON array");
        }
        return writeJson(node, fieldName);
    }

    private String normalizeJsonObject(JsonNode value, String fieldName) {
        if (value == null || value.isNull()) {
            return "{}";
        }

        JsonNode node = normalizeJsonNode(value, fieldName);
        if (!node.isObject()) {
            throw new IllegalArgumentException(fieldName + " must be a JSON object");
        }
        return writeJson(node, fieldName);
    }

    private JsonNode normalizeJsonNode(JsonNode value, String fieldName) {
        if (!value.isTextual()) {
            return value;
        }

        try {
            return objectMapper.readTree(value.asText());
        } catch (Exception exception) {
            throw new IllegalArgumentException(fieldName + " must be valid JSON");
        }
    }

    private String writeJson(JsonNode value, String fieldName) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception exception) {
            throw new IllegalArgumentException(fieldName + " must be valid JSON");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private record ValidatedAttributeRequest(
            Long categoryId,
            String code,
            String defaultLabel,
            String dataType,
            String unit,
            String options,
            String validationRules,
            String uiConfig,
            boolean required,
            boolean filterable,
            boolean comparable,
            int sortOrder,
            String status
    ) {
    }
}
