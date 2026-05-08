package com.example.b2btruck.product;

import com.example.b2btruck.auth.PermissionService;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/products/{productId}/translations")
public class ProductTranslationController {

    private final ProductTranslationService translationService;
    private final PermissionService permissionService;

    public ProductTranslationController(
            ProductTranslationService translationService,
            PermissionService permissionService
    ) {
        this.translationService = translationService;
        this.permissionService = permissionService;
    }

    @GetMapping
    List<ProductTranslationResponse> list(Authentication authentication, @PathVariable Long productId) {
        permissionService.requirePermission(authentication, "product:read");
        return translationService.list(productId);
    }

    @GetMapping("/{locale}")
    ProductTranslationResponse get(
            Authentication authentication,
            @PathVariable Long productId,
            @PathVariable String locale
    ) {
        permissionService.requirePermission(authentication, "product:read");
        return translationService.get(productId, locale);
    }

    @PutMapping("/{locale}")
    ProductTranslationResponse upsert(
            Authentication authentication,
            @PathVariable Long productId,
            @PathVariable String locale,
            @RequestBody ProductTranslationRequest request
    ) {
        permissionService.requirePermission(authentication, "product:write");
        return translationService.upsert(productId, locale, request);
    }
}
