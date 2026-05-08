package com.example.b2btruck.category;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/categories")
public class PublicVehicleCategoryController {

    private final PublicVehicleCategoryService publicVehicleCategoryService;

    public PublicVehicleCategoryController(PublicVehicleCategoryService publicVehicleCategoryService) {
        this.publicVehicleCategoryService = publicVehicleCategoryService;
    }

    @GetMapping
    List<PublicVehicleCategoryResponse> list(@RequestParam(required = false) String locale) {
        return publicVehicleCategoryService.listActiveTree(locale);
    }
}
