package com.example.b2btruck.product;

import static org.hamcrest.Matchers.hasKey;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.b2btruck.category.CreateVehicleCategoryCommand;
import com.example.b2btruck.category.VehicleCategory;
import com.example.b2btruck.category.VehicleCategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PublicProductControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private VehicleCategoryRepository vehicleCategoryRepository;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update("delete from product_translation");
        jdbcTemplate.update("delete from product");
        jdbcTemplate.update("delete from vehicle_attribute_definition");
        jdbcTemplate.update("delete from vehicle_category");
    }

    @Test
    void listsPublishedProductsWithLocaleFallbackAndPagination() throws Exception {
        VehicleCategory category = createCategory(null, "FUEL_TANK_TRUCK", "fuel-tank-truck", "Fuel Tank Truck", "ACTIVE", 10);
        Long productId = createProduct(category.id(), "SKU-10000L", "fuel-tank-truck-10000l", "PUBLISHED", 10_000, true);
        createTranslation(productId, "es-MX", "Camion cisterna 10000L", "Camion para combustible");
        createProduct(category.id(), "SKU-DRAFT", "draft-truck", "DRAFT", 10_000, false);

        mockMvc.perform(get("/api/public/products")
                        .queryParam("locale", "es-MX")
                        .queryParam("category", "fuel-tank-truck")
                        .queryParam("page", "1")
                        .queryParam("pageSize", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.page").value(1))
                .andExpect(jsonPath("$.data.pageSize").value(10))
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.items[0].id").value(productId))
                .andExpect(jsonPath("$.data.items[0].name").value("Camion cisterna 10000L"))
                .andExpect(jsonPath("$.data.items[0].summary").value("Camion para combustible"))
                .andExpect(jsonPath("$.data.items[0].categorySlug").value("fuel-tank-truck"))
                .andExpect(jsonPath("$.data.items[0].specs.tank_capacity").value(10000))
                .andExpect(jsonPath("$.data.items[0].seo.title").value("Camion cisterna 10000L"));
    }

    @Test
    void filtersBySpecsAndIncludesChildCategories() throws Exception {
        VehicleCategory root = createCategory(null, "TRUCKS", "trucks", "Trucks", "ACTIVE", 1);
        VehicleCategory tank = createCategory(root.id(), "FUEL_TANK_TRUCK", "fuel-tank-truck", "Fuel Tank Truck", "ACTIVE", 10);
        createProduct(tank.id(), "SKU-10000L", "fuel-tank-truck-10000l", "PUBLISHED", 10_000, true);
        createProduct(tank.id(), "SKU-5000L", "fuel-tank-truck-5000l", "PUBLISHED", 5_000, false);

        mockMvc.perform(get("/api/public/products")
                        .queryParam("category", "trucks")
                        .queryParam("tank_capacity", "10000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.items[0].slug").value("fuel-tank-truck-10000l"));
    }

    @Test
    void hidesOfflineProductsAndDisabledCategoriesWithoutAuthentication() throws Exception {
        VehicleCategory active = createCategory(null, "ACTIVE_TRUCK", "active-truck", "Active Truck", "ACTIVE", 1);
        VehicleCategory disabled = createCategory(null, "DISABLED_TRUCK", "disabled-truck", "Disabled Truck", "DISABLED", 2);
        createProduct(active.id(), "SKU-PUBLISHED", "published-truck", "PUBLISHED", 10_000, false);
        createProduct(active.id(), "SKU-OFFLINE", "offline-truck", "OFFLINE", 10_000, false);
        createProduct(disabled.id(), "SKU-DISABLED", "disabled-category-truck", "PUBLISHED", 10_000, false);

        mockMvc.perform(get("/api/public/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.items[0].slug").value("published-truck"))
                .andExpect(jsonPath("$.data.items[0]", not(hasKey("status"))));
    }

    @Test
    void returnsPublishedProductDetailWithLocalizedContent() throws Exception {
        VehicleCategory category = createCategory(null, "FUEL_TANK_TRUCK", "fuel-tank-truck", "Fuel Tank Truck", "ACTIVE", 10);
        Long productId = createProduct(category.id(), "SKU-10000L", "fuel-tank-truck-10000l", "PUBLISHED", 10_000, true);
        createTranslation(productId, "fr-DZ", "Camion-citerne 10000L", "Camion pour carburant");

        mockMvc.perform(get("/api/public/products/fuel-tank-truck-10000l")
                        .queryParam("locale", "fr-DZ"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(productId))
                .andExpect(jsonPath("$.data.name").value("Camion-citerne 10000L"))
                .andExpect(jsonPath("$.data.summary").value("Camion pour carburant"))
                .andExpect(jsonPath("$.data.description").value("Localized description"))
                .andExpect(jsonPath("$.data.applications").value("Fuel transport"))
                .andExpect(jsonPath("$.data.categorySlug").value("fuel-tank-truck"))
                .andExpect(jsonPath("$.data.specs.tank_capacity").value(10000))
                .andExpect(jsonPath("$.data.localizedSpecs.tank_capacity").value("10000 L"))
                .andExpect(jsonPath("$.data.shippingConfig").exists())
                .andExpect(jsonPath("$.data.media").isArray())
                .andExpect(jsonPath("$.data.buttons").isArray())
                .andExpect(jsonPath("$.data", not(hasKey("status"))));
    }

    @Test
    void returnsNotFoundForUnpublishedOrDisabledCategoryProductDetail() throws Exception {
        VehicleCategory active = createCategory(null, "ACTIVE_TRUCK", "active-truck", "Active Truck", "ACTIVE", 1);
        VehicleCategory disabled = createCategory(null, "DISABLED_TRUCK", "disabled-truck", "Disabled Truck", "DISABLED", 2);
        createProduct(active.id(), "SKU-DRAFT", "draft-truck", "DRAFT", 10_000, false);
        createProduct(disabled.id(), "SKU-DISABLED", "disabled-category-truck", "PUBLISHED", 10_000, false);

        mockMvc.perform(get("/api/public/products/draft-truck"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("PRODUCT_NOT_FOUND"));

        mockMvc.perform(get("/api/public/products/disabled-category-truck"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("PRODUCT_NOT_FOUND"));
    }

    private VehicleCategory createCategory(
            Long parentId,
            String code,
            String slug,
            String defaultName,
            String status,
            int sortOrder
    ) {
        return vehicleCategoryRepository.save(new CreateVehicleCategoryCommand(
                parentId,
                code,
                slug,
                defaultName,
                defaultName + " description",
                status,
                sortOrder,
                "{\"title\":\"" + defaultName + "\"}",
                "{}"
        ));
    }

    private Long createProduct(
            Long categoryId,
            String sku,
            String slug,
            String status,
            int tankCapacity,
            boolean featured
    ) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(
                connection -> {
                    var statement = connection.prepareStatement(
                            """
                                    insert into product (
                                        category_id,
                                        sku,
                                        slug,
                                        default_name,
                                        default_summary,
                                        status,
                                        specs,
                                        seo_config,
                                        shipping_config,
                                        featured,
                                        published_at
                                    )
                                    values (?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, '{}'::jsonb, ?, case when ? = 'PUBLISHED' then now() else null end)
                                    """,
                            new String[]{"id"}
                    );
                    statement.setLong(1, categoryId);
                    statement.setString(2, sku);
                    statement.setString(3, slug);
                    statement.setString(4, "10,000L Fuel Tank Truck");
                    statement.setString(5, "Road fuel delivery truck");
                    statement.setString(6, status);
                    statement.setString(7, "{\"tank_capacity\":" + tankCapacity + "}");
                    statement.setString(8, "{\"title\":\"Fuel Tank Truck\",\"description\":\"Fuel truck\"}");
                    statement.setBoolean(9, featured);
                    statement.setString(10, status);
                    return statement;
                },
                keyHolder
        );

        Number key = keyHolder.getKey();
        if (key == null) {
            throw new IllegalStateException("Product id was not generated");
        }
        return key.longValue();
    }

    private void createTranslation(Long productId, String locale, String name, String summary) {
        jdbcTemplate.update(
                """
                        insert into product_translation (
                            product_id,
                            locale,
                            name,
                            summary,
                            description,
                            applications,
                            localized_specs,
                            seo_title,
                            seo_description
                        )
                        values (?, ?, ?, ?, ?, ?, ?::jsonb, ?, ?)
                        """,
                productId,
                locale,
                name,
                summary,
                "Localized description",
                "Fuel transport",
                "{\"tank_capacity\":\"10000 L\"}",
                name,
                summary
        );
    }
}
