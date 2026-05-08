package com.example.b2btruck.category;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class VehicleCategoryService {

    private static final String DEFAULT_STATUS = "ACTIVE";

    private final VehicleCategoryRepository vehicleCategoryRepository;

    public VehicleCategoryService(VehicleCategoryRepository vehicleCategoryRepository) {
        this.vehicleCategoryRepository = vehicleCategoryRepository;
    }

    public List<VehicleCategoryResponse> listTree(String keyword, String status) {
        List<VehicleCategory> categories = vehicleCategoryRepository.findAll(keyword, status);
        Map<Long, MutableCategoryNode> nodes = new LinkedHashMap<>();

        for (VehicleCategory category : categories) {
            nodes.put(category.id(), new MutableCategoryNode(category));
        }

        List<MutableCategoryNode> roots = new ArrayList<>();
        for (MutableCategoryNode node : nodes.values()) {
            if (node.category().parentId() != null && nodes.containsKey(node.category().parentId())) {
                nodes.get(node.category().parentId()).children().add(node);
            } else {
                roots.add(node);
            }
        }

        return roots.stream().map(MutableCategoryNode::toResponse).toList();
    }

    public VehicleCategoryResponse create(VehicleCategoryRequest request) {
        validateRequest(request);
        VehicleCategory category = vehicleCategoryRepository.save(new CreateVehicleCategoryCommand(
                request.parentId(),
                request.code().trim(),
                request.slug().trim(),
                request.defaultName().trim(),
                request.defaultDescription(),
                normalizeStatus(request.status()),
                request.sortOrder() == null ? 0 : request.sortOrder(),
                request.seoConfig(),
                request.displayConfig()
        ));
        return VehicleCategoryResponse.from(category);
    }

    public VehicleCategoryResponse update(Long id, VehicleCategoryRequest request) {
        validateRequest(request);
        VehicleCategory category = vehicleCategoryRepository.update(id, new UpdateVehicleCategoryCommand(
                request.parentId(),
                request.code().trim(),
                request.slug().trim(),
                request.defaultName().trim(),
                request.defaultDescription(),
                normalizeStatus(request.status()),
                request.sortOrder() == null ? 0 : request.sortOrder(),
                request.seoConfig(),
                request.displayConfig()
        ));
        return VehicleCategoryResponse.from(category);
    }

    private void validateRequest(VehicleCategoryRequest request) {
        if (request == null || isBlank(request.code()) || isBlank(request.slug()) || isBlank(request.defaultName())) {
            throw new IllegalArgumentException("code, slug and defaultName are required");
        }
    }

    private String normalizeStatus(String status) {
        return isBlank(status) ? DEFAULT_STATUS : status.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private record MutableCategoryNode(VehicleCategory category, List<MutableCategoryNode> children) {

        MutableCategoryNode(VehicleCategory category) {
            this(category, new ArrayList<>());
        }

        VehicleCategoryResponse toResponse() {
            return VehicleCategoryResponse.from(category, children.stream().map(MutableCategoryNode::toResponse).toList());
        }
    }
}
