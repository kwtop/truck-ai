package com.example.b2btruck.product;

import com.example.b2btruck.attribute.VehicleAttributeDefinition;
import com.example.b2btruck.attribute.VehicleAttributeDefinitionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class ProductSpecValidator {

    private static final String ACTIVE_STATUS = "ACTIVE";

    private final VehicleAttributeDefinitionRepository attributeDefinitionRepository;
    private final ObjectMapper objectMapper;

    public ProductSpecValidator(
            VehicleAttributeDefinitionRepository attributeDefinitionRepository,
            ObjectMapper objectMapper
    ) {
        this.attributeDefinitionRepository = attributeDefinitionRepository;
        this.objectMapper = objectMapper;
    }

    public JsonNode validate(Long categoryId, String specsJson) {
        if (categoryId == null) {
            throw new ProductSpecValidationException("categoryId is required for specs validation");
        }

        JsonNode specs = parseObject(specsJson, "specs");
        validate(categoryId, specs);
        return specs;
    }

    public void validate(Long categoryId, JsonNode specs) {
        if (categoryId == null) {
            throw new ProductSpecValidationException("categoryId is required for specs validation");
        }
        if (specs == null || specs.isNull()) {
            specs = objectMapper.createObjectNode();
        }
        if (!specs.isObject()) {
            throw new ProductSpecValidationException("specs must be a JSON object");
        }

        List<VehicleAttributeDefinition> definitions = attributeDefinitionRepository.findByCategoryId(categoryId)
                .stream()
                .filter(definition -> ACTIVE_STATUS.equals(definition.status()))
                .toList();
        Map<String, VehicleAttributeDefinition> definitionsByCode = definitions.stream()
                .collect(Collectors.toMap(VehicleAttributeDefinition::code, Function.identity()));
        List<String> errors = new ArrayList<>();

        for (VehicleAttributeDefinition definition : definitions) {
            JsonNode value = specs.get(definition.code());
            if (definition.required() && isMissing(value)) {
                errors.add(definition.code() + " is required");
                continue;
            }
            if (!isMissing(value)) {
                validateValue(definition, value, errors);
            }
        }

        Iterator<String> fieldNames = specs.fieldNames();
        while (fieldNames.hasNext()) {
            String fieldName = fieldNames.next();
            if (!definitionsByCode.containsKey(fieldName)) {
                errors.add(fieldName + " is not defined for category " + categoryId);
            }
        }

        if (!errors.isEmpty()) {
            throw new ProductSpecValidationException(String.join("; ", errors));
        }
    }

    private void validateValue(VehicleAttributeDefinition definition, JsonNode value, List<String> errors) {
        JsonNode validationRules = parseJsonObject(definition.validationRules());
        JsonNode options = parseJsonArray(definition.options());

        switch (definition.dataType()) {
            case "number" -> validateNumber(definition.code(), value, validationRules, errors);
            case "text" -> validateText(definition.code(), value, validationRules, errors);
            case "select" -> validateSelect(definition.code(), value, options, errors);
            case "multi_select" -> validateMultiSelect(definition.code(), value, options, errors);
            case "boolean" -> validateBoolean(definition.code(), value, errors);
            case "range" -> validateRange(definition.code(), value, validationRules, errors);
            default -> errors.add(definition.code() + " has unsupported data type " + definition.dataType());
        }
    }

    private void validateNumber(String code, JsonNode value, JsonNode validationRules, List<String> errors) {
        if (!value.isNumber()) {
            errors.add(code + " must be a number");
            return;
        }

        validateNumberBounds(code, value.doubleValue(), validationRules, errors);
    }

    private void validateText(String code, JsonNode value, JsonNode validationRules, List<String> errors) {
        if (!value.isTextual()) {
            errors.add(code + " must be text");
            return;
        }

        JsonNode regex = validationRules.get("regex");
        if (regex != null && regex.isTextual() && !value.asText().matches(regex.asText())) {
            errors.add(code + " does not match required format");
        }
    }

    private void validateSelect(String code, JsonNode value, JsonNode options, List<String> errors) {
        if (!value.isTextual()) {
            errors.add(code + " must be a text option");
            return;
        }

        if (options.size() > 0 && !optionValues(options).contains(value.asText())) {
            errors.add(code + " must be one of configured options");
        }
    }

    private void validateMultiSelect(String code, JsonNode value, JsonNode options, List<String> errors) {
        if (!value.isArray()) {
            errors.add(code + " must be an array of options");
            return;
        }

        Set<String> allowedOptions = optionValues(options);
        for (JsonNode item : value) {
            if (!item.isTextual()) {
                errors.add(code + " must contain only text options");
                return;
            }
            if (!allowedOptions.isEmpty() && !allowedOptions.contains(item.asText())) {
                errors.add(code + " contains an option that is not configured");
                return;
            }
        }
    }

    private void validateBoolean(String code, JsonNode value, List<String> errors) {
        if (!value.isBoolean()) {
            errors.add(code + " must be boolean");
        }
    }

    private void validateRange(String code, JsonNode value, JsonNode validationRules, List<String> errors) {
        if (!value.isObject() || !value.path("min").isNumber() || !value.path("max").isNumber()) {
            errors.add(code + " must be an object with numeric min and max");
            return;
        }

        double min = value.path("min").doubleValue();
        double max = value.path("max").doubleValue();
        if (min > max) {
            errors.add(code + " min cannot be greater than max");
            return;
        }

        validateNumberBounds(code + ".min", min, validationRules, errors);
        validateNumberBounds(code + ".max", max, validationRules, errors);
    }

    private void validateNumberBounds(
            String code,
            double value,
            JsonNode validationRules,
            List<String> errors
    ) {
        JsonNode min = validationRules.get("min");
        if (min != null && min.isNumber() && value < min.doubleValue()) {
            errors.add(code + " must be greater than or equal to " + min.asText());
        }

        JsonNode max = validationRules.get("max");
        if (max != null && max.isNumber() && value > max.doubleValue()) {
            errors.add(code + " must be less than or equal to " + max.asText());
        }
    }

    private Set<String> optionValues(JsonNode options) {
        Set<String> values = new HashSet<>();
        for (JsonNode option : options) {
            if (option.isTextual()) {
                values.add(option.asText());
            }
        }
        return values;
    }

    private JsonNode parseObject(String json, String fieldName) {
        if (json == null || json.isBlank()) {
            return objectMapper.createObjectNode();
        }

        try {
            JsonNode node = objectMapper.readTree(json);
            if (!node.isObject()) {
                throw new ProductSpecValidationException(fieldName + " must be a JSON object");
            }
            return node;
        } catch (ProductSpecValidationException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ProductSpecValidationException(fieldName + " must be valid JSON");
        }
    }

    private JsonNode parseJsonObject(String json) {
        JsonNode node = parseJson(json, objectMapper.createObjectNode());
        return node.isObject() ? node : objectMapper.createObjectNode();
    }

    private JsonNode parseJsonArray(String json) {
        JsonNode node = parseJson(json, objectMapper.createArrayNode());
        return node.isArray() ? node : objectMapper.createArrayNode();
    }

    private JsonNode parseJson(String json, JsonNode fallback) {
        if (json == null || json.isBlank()) {
            return fallback;
        }

        try {
            JsonNode node = objectMapper.readTree(json);
            if (node.isTextual()) {
                return parseJson(node.asText(), fallback);
            }
            return node;
        } catch (Exception exception) {
            return fallback;
        }
    }

    private boolean isMissing(JsonNode value) {
        return value == null || value.isNull() || (value.isTextual() && value.asText().isBlank());
    }
}
