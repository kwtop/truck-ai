package com.example.b2btruck.category;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class PublicVehicleCategoryService {

    private static final String ACTIVE_STATUS = "ACTIVE";

    private final VehicleCategoryRepository vehicleCategoryRepository;
    private final ObjectMapper objectMapper;

    public PublicVehicleCategoryService(
            VehicleCategoryRepository vehicleCategoryRepository,
            ObjectMapper objectMapper
    ) {
        this.vehicleCategoryRepository = vehicleCategoryRepository;
        this.objectMapper = objectMapper;
    }

    public List<PublicVehicleCategoryResponse> listActiveTree(String locale) {
        List<VehicleCategory> categories = vehicleCategoryRepository.findAll(null, ACTIVE_STATUS);
        Map<Long, MutableCategoryNode> nodes = new LinkedHashMap<>();

        for (VehicleCategory category : categories) {
            nodes.put(category.id(), new MutableCategoryNode(category));
        }

        List<MutableCategoryNode> roots = new ArrayList<>();
        for (MutableCategoryNode node : nodes.values()) {
            Long parentId = node.category().parentId();
            if (parentId != null && nodes.containsKey(parentId)) {
                nodes.get(parentId).children().add(node);
            } else {
                roots.add(node);
            }
        }

        return roots.stream().map(this::toResponse).toList();
    }

    private PublicVehicleCategoryResponse toResponse(MutableCategoryNode node) {
        VehicleCategory category = node.category();
        return PublicVehicleCategoryResponse.from(
                category,
                parseJsonObject(category.seoConfig()),
                parseJsonObject(category.displayConfig()),
                node.children().stream().map(this::toResponse).toList()
        );
    }

    private JsonNode parseJsonObject(String value) {
        if (value == null || value.isBlank()) {
            return objectMapper.createObjectNode();
        }

        try {
            JsonNode node = objectMapper.readTree(value);
            if (node.isTextual()) {
                return parseJsonObject(node.asText());
            }
            return node.isObject() ? node : objectMapper.createObjectNode();
        } catch (Exception exception) {
            return objectMapper.createObjectNode();
        }
    }

    private record MutableCategoryNode(VehicleCategory category, List<MutableCategoryNode> children) {

        MutableCategoryNode(VehicleCategory category) {
            this(category, new ArrayList<>());
        }
    }
}
