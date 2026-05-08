package com.example.b2btruck.category;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
class VehicleCategoryControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

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
    void createsUpdatesAndListsCategoryTree() throws Exception {
        createUser("admin", "CorrectPassword1!");
        createRoleWithPermissions("ADMIN", "category:read", "category:write");
        linkUserRole("admin", "ADMIN");
        String token = loginToken("admin", "CorrectPassword1!");

        Long rootId = createCategory(token, null, "TRUCKS", "trucks", "Trucks", "ACTIVE", 10);
        Long childId = createCategory(token, rootId, "TANK_TRUCK", "tank-truck", "Tank Truck", "ACTIVE", 20);

        mockMvc.perform(put("/api/admin/categories/{id}", childId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "parentId": %d,
                                  "code": "TANK_TRUCK",
                                  "slug": "tank-truck",
                                  "defaultName": "Tank Truck",
                                  "defaultDescription": "Fuel and water tank trucks",
                                  "status": "DISABLED",
                                  "sortOrder": 5,
                                  "seoConfig": "{}",
                                  "displayConfig": "{}"
                                }
                                """.formatted(rootId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("DISABLED"))
                .andExpect(jsonPath("$.data.sortOrder").value(5));

        mockMvc.perform(get("/api/admin/categories")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].code").value("TRUCKS"))
                .andExpect(jsonPath("$.data[0].children[0].code").value("TANK_TRUCK"))
                .andExpect(jsonPath("$.data[0].children[0].status").value("DISABLED"));
    }

    @Test
    void rejectsCreateWithoutWritePermission() throws Exception {
        createUser("operator", "CorrectPassword1!");
        createRoleWithPermissions("OPERATOR", "category:read");
        linkUserRole("operator", "OPERATOR");
        String token = loginToken("operator", "CorrectPassword1!");

        mockMvc.perform(post("/api/admin/categories")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "code": "TRUCKS",
                                  "slug": "trucks",
                                  "defaultName": "Trucks"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("AUTH_FORBIDDEN"));
    }

    @Test
    void rejectsInvalidCategoryPayload() throws Exception {
        createUser("admin", "CorrectPassword1!");
        createRoleWithPermissions("ADMIN", "category:read", "category:write");
        linkUserRole("admin", "ADMIN");
        String token = loginToken("admin", "CorrectPassword1!");

        mockMvc.perform(post("/api/admin/categories")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "code": "",
                                  "slug": "trucks"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("BAD_REQUEST"));
    }

    private Long createCategory(
            String token,
            Long parentId,
            String code,
            String slug,
            String defaultName,
            String status,
            int sortOrder
    ) throws Exception {
        String response = mockMvc.perform(post("/api/admin/categories")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "parentId": %s,
                                  "code": "%s",
                                  "slug": "%s",
                                  "defaultName": "%s",
                                  "defaultDescription": "%s description",
                                  "status": "%s",
                                  "sortOrder": %d,
                                  "seoConfig": "{}",
                                  "displayConfig": "{}"
                                }
                                """.formatted(parentId == null ? "null" : parentId, code, slug, defaultName, defaultName, status, sortOrder)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.code").value(code))
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(response).path("data").path("id").asLong();
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
