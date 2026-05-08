package com.example.b2btruck.category;

import com.example.b2btruck.auth.PermissionService;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/categories")
public class VehicleCategoryController {

    private final VehicleCategoryService vehicleCategoryService;
    private final PermissionService permissionService;

    public VehicleCategoryController(
            VehicleCategoryService vehicleCategoryService,
            PermissionService permissionService
    ) {
        this.vehicleCategoryService = vehicleCategoryService;
        this.permissionService = permissionService;
    }

    @GetMapping
    List<VehicleCategoryResponse> list(
            Authentication authentication,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status
    ) {
        permissionService.requirePermission(authentication, "category:read");
        return vehicleCategoryService.listTree(keyword, status);
    }

    @PostMapping
    VehicleCategoryResponse create(Authentication authentication, @RequestBody VehicleCategoryRequest request) {
        permissionService.requirePermission(authentication, "category:write");
        return vehicleCategoryService.create(request);
    }

    @PutMapping("/{id}")
    VehicleCategoryResponse update(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody VehicleCategoryRequest request
    ) {
        permissionService.requirePermission(authentication, "category:write");
        return vehicleCategoryService.update(id, request);
    }
}
