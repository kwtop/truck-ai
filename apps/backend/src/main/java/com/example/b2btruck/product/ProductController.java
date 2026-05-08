package com.example.b2btruck.product;

import com.example.b2btruck.auth.PermissionService;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/products")
public class ProductController {

    private final ProductService productService;
    private final PermissionService permissionService;

    public ProductController(ProductService productService, PermissionService permissionService) {
        this.productService = productService;
        this.permissionService = permissionService;
    }

    @GetMapping
    List<ProductResponse> list(
            Authentication authentication,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status
    ) {
        permissionService.requirePermission(authentication, "product:read");
        return productService.list(categoryId, keyword, status);
    }

    @GetMapping("/{id}")
    ProductResponse get(Authentication authentication, @PathVariable Long id) {
        permissionService.requirePermission(authentication, "product:read");
        return productService.get(id);
    }

    @PostMapping
    ProductResponse create(Authentication authentication, @RequestBody ProductRequest request) {
        permissionService.requirePermission(authentication, "product:write");
        return productService.create(request, authentication);
    }

    @PutMapping("/{id}")
    ProductResponse update(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody ProductRequest request
    ) {
        permissionService.requirePermission(authentication, "product:write");
        return productService.update(id, request, authentication);
    }

    @DeleteMapping("/{id}")
    void delete(Authentication authentication, @PathVariable Long id) {
        permissionService.requirePermission(authentication, "product:write");
        productService.delete(id, authentication);
    }
}
