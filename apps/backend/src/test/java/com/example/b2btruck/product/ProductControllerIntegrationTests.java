package com.example.b2btruck.product;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.b2btruck.attribute.CreateVehicleAttributeDefinitionCommand;
import com.example.b2btruck.attribute.VehicleAttributeDefinitionRepository;
import com.example.b2btruck.category.CreateVehicleCategoryCommand;
import com.example.b2btruck.category.VehicleCategoryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private VehicleCategoryRepository vehicleCategoryRepository;

    @Autowired
    private VehicleAttributeDefinitionRepository attributeDefinitionRepository;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update("delete from product_translation");
        jdbcTemplate.update("delete from product");
        jdbcTemplate.update("delete from vehicle_attribute_definition");
        jdbcTemplate.update("delete from vehicle_category");
        jdbcTemplate.update("delete from sys_role_permission");
        jdbcTemplate.update("delete from sys_user_role");
        jdbcTemplate.update("delete from sys_permission");
        jdbcTemplate.update("delete from sys_role");
        jdbcTemplate.update("delete from sys_user");
    }

    @Test
    void createsUpdatesPublishesListsAndDeletesProduct() throws Exception {
        Long categoryId = createCategory();
        createTankCapacityAttribute(categoryId);
        createUser("admin", "CorrectPassword1!");
        createRoleWithPermissions("ADMIN", "product:read", "product:write");
        linkUserRole("admin", "ADMIN");
        String token = loginToken("admin", "CorrectPassword1!");

        Long productId = createProduct(token, categoryId, "SKU-10000L", "fuel-tank-truck-10000l");

        mockMvc.perform(put("/api/admin/products/{id}", productId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "categoryId": %d,
                                  "sku": "SKU-10000L",
                                  "slug": "fuel-tank-truck-10000l",
                                  "defaultName": "10,000L Fuel Tank Truck Updated",
                                  "defaultSummary": "Road fuel delivery truck",
                                  "status": "PUBLISHED",
                                  "specs": {"tank_capacity": 10000},
                                  "seoConfig": {"title": "Fuel Tank Truck"},
                                  "shippingConfig": {"container": "40HQ"},
                                  "aiEnabled": true,
                                  "featured": true,
                                  "sortOrder": 2
                                }
                                """.formatted(categoryId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("PUBLISHED"))
                .andExpect(jsonPath("$.data.featured").value(true))
                .andExpect(jsonPath("$.data.publishedAt").isNotEmpty())
                .andExpect(jsonPath("$.data.specs.tank_capacity").value(10000));

        mockMvc.perform(get("/api/admin/products")
                        .queryParam("categoryId", categoryId.toString())
                        .queryParam("status", "PUBLISHED")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(productId))
                .andExpect(jsonPath("$.data[0].defaultName").value("10,000L Fuel Tank Truck Updated"));

        mockMvc.perform(get("/api/admin/products/{id}", productId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.slug").value("fuel-tank-truck-10000l"));

        mockMvc.perform(delete("/api/admin/products/{id}", productId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/api/admin/products/{id}", productId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("PRODUCT_NOT_FOUND"));
    }

    @Test
    void rejectsCreateWithoutWritePermission() throws Exception {
        Long categoryId = createCategory();
        createTankCapacityAttribute(categoryId);
        createUser("operator", "CorrectPassword1!");
        createRoleWithPermissions("OPERATOR", "product:read");
        linkUserRole("operator", "OPERATOR");
        String token = loginToken("operator", "CorrectPassword1!");

        mockMvc.perform(post("/api/admin/products")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validProductPayload(categoryId, "SKU-10000L", "fuel-tank-truck-10000l", "DRAFT")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("AUTH_FORBIDDEN"));
    }

    @Test
    void rejectsInvalidSpecs() throws Exception {
        Long categoryId = createCategory();
        createTankCapacityAttribute(categoryId);
        createUser("admin", "CorrectPassword1!");
        createRoleWithPermissions("ADMIN", "product:read", "product:write");
        linkUserRole("admin", "ADMIN");
        String token = loginToken("admin", "CorrectPassword1!");

        mockMvc.perform(post("/api/admin/products")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "categoryId": %d,
                                  "sku": "SKU-10000L",
                                  "slug": "fuel-tank-truck-10000l",
                                  "defaultName": "10,000L Fuel Tank Truck",
                                  "specs": {"tank_capacity": "10000"}
                                }
                                """.formatted(categoryId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("PRODUCT_SPEC_INVALID"));
    }

    private Long createProduct(String token, Long categoryId, String sku, String slug) throws Exception {
        String response = mockMvc.perform(post("/api/admin/products")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validProductPayload(categoryId, sku, slug, "DRAFT")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.data.defaultName").value("10,000L Fuel Tank Truck"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(response).path("data").path("id").asLong();
    }

    private String validProductPayload(Long categoryId, String sku, String slug, String status) {
        return """
                {
                  "categoryId": %d,
                  "sku": "%s",
                  "slug": "%s",
                  "defaultName": "10,000L Fuel Tank Truck",
                  "defaultSummary": "Road fuel delivery truck",
                  "status": "%s",
                  "specs": {"tank_capacity": 10000},
                  "seoConfig": {},
                  "shippingConfig": {},
                  "aiEnabled": true,
                  "featured": false,
                  "sortOrder": 1
                }
                """.formatted(categoryId, sku, slug, status);
    }

    private Long createCategory() {
        return vehicleCategoryRepository.save(new CreateVehicleCategoryCommand(
                null,
                "FUEL_TANK_TRUCK",
                "fuel-tank-truck",
                "Fuel Tank Truck",
                "Fuel and water tank trucks",
                "ACTIVE",
                10,
                "{}",
                "{}"
        )).id();
    }

    private void createTankCapacityAttribute(Long categoryId) {
        attributeDefinitionRepository.save(new CreateVehicleAttributeDefinitionCommand(
                categoryId,
                "tank_capacity",
                "Tank Capacity",
                "number",
                "L",
                "[]",
                "{\"min\":1000,\"max\":50000}",
                "{}",
                true,
                true,
                true,
                10,
                "ACTIVE"
        ));
    }

    private void createUser(String username, String password) {
        jdbcTemplate.update(
                """
                        insert into sys_user (username, email, password_hash, display_name, status)
                        values (?, ?, ?, ?, 'ACTIVE')
                        """,
                username,
                username + "@example.com",
                passwordEncoder.encode(password),
                username
        );
    }

    private void createRoleWithPermissions(String roleCode, String... permissionCodes) {
        jdbcTemplate.update("insert into sys_role (code, name) values (?, ?)", roleCode, roleCode);

        for (String permissionCode : permissionCodes) {
            jdbcTemplate.update(
                    """
                            insert into sys_permission (code, name, resource_type, action)
                            values (?, ?, 'API', 'read')
                            """,
                    permissionCode,
                    permissionCode
            );
            jdbcTemplate.update(
                    """
                            insert into sys_role_permission (role_id, permission_id)
                            select r.id, p.id
                            from sys_role r, sys_permission p
                            where r.code = ? and p.code = ?
                            """,
                    roleCode,
                    permissionCode
            );
        }
    }

    private void linkUserRole(String username, String roleCode) {
        jdbcTemplate.update(
                """
                        insert into sys_user_role (user_id, role_id)
                        select u.id, r.id
                        from sys_user u, sys_role r
                        where u.username = ? and r.code = ?
                        """,
                username,
                roleCode
        );
    }

    private String loginToken(String username, String password) throws Exception {
        String content = mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "%s",
                                  "password": "%s"
                                }
                                """.formatted(username, password)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(content).path("data").path("token").asText();
    }
}
