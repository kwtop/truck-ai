package com.example.b2btruck.attribute;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
class VehicleAttributeDefinitionControllerIntegrationTests {

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

    @BeforeEach
    void setUp() {
        jdbcTemplate.update("delete from vehicle_attribute_definition");
        jdbcTemplate.update("delete from vehicle_category");
        jdbcTemplate.update("delete from sys_role_permission");
        jdbcTemplate.update("delete from sys_user_role");
        jdbcTemplate.update("delete from sys_permission");
        jdbcTemplate.update("delete from sys_role");
        jdbcTemplate.update("delete from sys_user");
    }

    @Test
    void createsUpdatesAndListsAttributeDefinitions() throws Exception {
        Long categoryId = createCategory();
        createUser("admin", "CorrectPassword1!");
        createRoleWithPermissions("ADMIN", "attribute:read", "attribute:write");
        linkUserRole("admin", "ADMIN");
        String token = loginToken("admin", "CorrectPassword1!");

        Long attributeId = createAttribute(token, categoryId, "tank_capacity", "number", 10);

        mockMvc.perform(put("/api/admin/attributes/{id}", attributeId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "categoryId": %d,
                                  "code": "tank_capacity",
                                  "defaultLabel": "Tank Capacity",
                                  "dataType": "range",
                                  "unit": "L",
                                  "options": [],
                                  "validationRules": {"min": 1000, "max": 50000},
                                  "uiConfig": {"step": 500},
                                  "required": true,
                                  "filterable": true,
                                  "comparable": false,
                                  "sortOrder": 5,
                                  "status": "DISABLED"
                                }
                                """.formatted(categoryId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.dataType").value("range"))
                .andExpect(jsonPath("$.data.status").value("DISABLED"))
                .andExpect(jsonPath("$.data.sortOrder").value(5));

        mockMvc.perform(get("/api/admin/attributes")
                        .queryParam("categoryId", categoryId.toString())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].code").value("tank_capacity"))
                .andExpect(jsonPath("$.data[0].filterable").value(true))
                .andExpect(jsonPath("$.data[0].comparable").value(false));
    }

    @Test
    void rejectsCreateWithoutWritePermission() throws Exception {
        Long categoryId = createCategory();
        createUser("operator", "CorrectPassword1!");
        createRoleWithPermissions("OPERATOR", "attribute:read");
        linkUserRole("operator", "OPERATOR");
        String token = loginToken("operator", "CorrectPassword1!");

        mockMvc.perform(post("/api/admin/attributes")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validAttributePayload(categoryId, "tank_capacity", "number", 10)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("AUTH_FORBIDDEN"));
    }

    @Test
    void rejectsInvalidAttributePayload() throws Exception {
        Long categoryId = createCategory();
        createUser("admin", "CorrectPassword1!");
        createRoleWithPermissions("ADMIN", "attribute:read", "attribute:write");
        linkUserRole("admin", "ADMIN");
        String token = loginToken("admin", "CorrectPassword1!");

        mockMvc.perform(post("/api/admin/attributes")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "categoryId": %d,
                                  "code": "tank_capacity",
                                  "defaultLabel": "Tank Capacity",
                                  "dataType": "unknown",
                                  "options": {},
                                  "validationRules": [],
                                  "uiConfig": {}
                                }
                                """.formatted(categoryId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("BAD_REQUEST"));
    }

    @Test
    void returnsNotFoundWhenUpdatingMissingAttribute() throws Exception {
        Long categoryId = createCategory();
        createUser("admin", "CorrectPassword1!");
        createRoleWithPermissions("ADMIN", "attribute:read", "attribute:write");
        linkUserRole("admin", "ADMIN");
        String token = loginToken("admin", "CorrectPassword1!");

        mockMvc.perform(put("/api/admin/attributes/{id}", 9999)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validAttributePayload(categoryId, "tank_capacity", "number", 10)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("ATTRIBUTE_NOT_FOUND"));
    }

    private Long createAttribute(
            String token,
            Long categoryId,
            String code,
            String dataType,
            int sortOrder
    ) throws Exception {
        String response = mockMvc.perform(post("/api/admin/attributes")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validAttributePayload(categoryId, code, dataType, sortOrder)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.code").value(code))
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(response).path("data").path("id").asLong();
    }

    private String validAttributePayload(Long categoryId, String code, String dataType, int sortOrder) {
        return """
                {
                  "categoryId": %d,
                  "code": "%s",
                  "defaultLabel": "Tank Capacity",
                  "dataType": "%s",
                  "unit": "L",
                  "options": [],
                  "validationRules": {"min": 1000, "max": 50000},
                  "uiConfig": {"widget": "number"},
                  "required": true,
                  "filterable": true,
                  "comparable": true,
                  "sortOrder": %d,
                  "status": "ACTIVE"
                }
                """.formatted(categoryId, code, dataType, sortOrder);
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
