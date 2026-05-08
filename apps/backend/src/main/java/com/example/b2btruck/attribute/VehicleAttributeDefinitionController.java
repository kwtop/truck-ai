package com.example.b2btruck.attribute;

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
@RequestMapping("/api/admin/attributes")
public class VehicleAttributeDefinitionController {

    private final VehicleAttributeDefinitionService attributeService;
    private final PermissionService permissionService;

    public VehicleAttributeDefinitionController(
            VehicleAttributeDefinitionService attributeService,
            PermissionService permissionService
    ) {
        this.attributeService = attributeService;
        this.permissionService = permissionService;
    }

    @GetMapping
    List<VehicleAttributeDefinitionResponse> list(
            Authentication authentication,
            @RequestParam Long categoryId
    ) {
        permissionService.requirePermission(authentication, "attribute:read");
        return attributeService.listByCategoryId(categoryId);
    }

    @PostMapping
    VehicleAttributeDefinitionResponse create(
            Authentication authentication,
            @RequestBody VehicleAttributeDefinitionRequest request
    ) {
        permissionService.requirePermission(authentication, "attribute:write");
        return attributeService.create(request);
    }

    @PutMapping("/{id}")
    VehicleAttributeDefinitionResponse update(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody VehicleAttributeDefinitionRequest request
    ) {
        permissionService.requirePermission(authentication, "attribute:write");
        return attributeService.update(id, request);
    }
}
