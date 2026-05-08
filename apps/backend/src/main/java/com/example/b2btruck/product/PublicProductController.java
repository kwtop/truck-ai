package com.example.b2btruck.product;

import com.example.b2btruck.common.api.PageResponse;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PublicProductController {

    private final PublicProductService publicProductService;

    public PublicProductController(PublicProductService publicProductService) {
        this.publicProductService = publicProductService;
    }

    @GetMapping("/api/public/products")
    PageResponse<PublicProductListItemResponse> list(
            @RequestParam(required = false) String locale,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer pageSize,
            @RequestParam Map<String, String> queryParams
    ) {
        return publicProductService.list(locale, category, keyword, page, pageSize, queryParams);
    }

    @GetMapping("/api/public/products/{slug}")
    PublicProductDetailResponse get(
            @PathVariable String slug,
            @RequestParam(required = false) String locale
    ) {
        return publicProductService.getBySlug(slug, locale);
    }
}
