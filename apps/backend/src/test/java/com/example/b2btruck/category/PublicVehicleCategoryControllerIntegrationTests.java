package com.example.b2btruck.category;

import static org.hamcrest.Matchers.hasKey;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PublicVehicleCategoryControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private VehicleCategoryRepository vehicleCategoryRepository;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update("delete from vehicle_attribute_definition");
        jdbcTemplate.update("delete from vehicle_category");
    }

    @Test
    void returnsActiveCategoryTreeWithoutAuthentication() throws Exception {
        VehicleCategory root = createCategory(null, "TRUCKS", "trucks", "Trucks", "ACTIVE", 10);
        createCategory(root.id(), "TANK_TRUCK", "tank-truck", "Tank Truck", "ACTIVE", 20);
        createCategory(root.id(), "DISABLED_TRUCK", "disabled-truck", "Disabled Truck", "DISABLED", 30);

        mockMvc.perform(get("/api/public/categories")
                        .queryParam("locale", "en-US"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].code").value("TRUCKS"))
                .andExpect(jsonPath("$.data[0].slug").value("trucks"))
                .andExpect(jsonPath("$.data[0].seoConfig.title").value("Trucks"))
                .andExpect(jsonPath("$.data[0].displayConfig.icon").value("truck"))
                .andExpect(jsonPath("$.data[0].children[0].code").value("TANK_TRUCK"))
                .andExpect(jsonPath("$.data[0].children.length()").value(1))
                .andExpect(jsonPath("$.data[0]", not(hasKey("status"))));
    }

    @Test
    void doesNotRequireAdminJwtForPublicCategories() throws Exception {
        createCategory(null, "TRUCKS", "trucks", "Trucks", "ACTIVE", 10);

        mockMvc.perform(get("/api/public/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].code").value("TRUCKS"));
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
                "{\"icon\":\"truck\"}"
        ));
    }
}
