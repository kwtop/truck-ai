package com.example.b2btruck.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
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
class AuthControllerIntegrationTests {

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
        jdbcTemplate.update("delete from sys_role_permission");
        jdbcTemplate.update("delete from sys_user_role");
        jdbcTemplate.update("delete from sys_permission");
        jdbcTemplate.update("delete from sys_role");
        jdbcTemplate.update("delete from sys_user");
    }

    @Test
    void loginReturnsJwtAndPermissionsForValidCredentials() throws Exception {
        createUser("admin", "CorrectPassword1!", "ACTIVE");
        createRoleWithPermission("ADMIN", "dashboard:read");
        linkUserRole("admin", "ADMIN");

        mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-Request-Id", "req_login_success")
                        .content("""
                                {
                                  "username": "admin",
                                  "password": "CorrectPassword1!"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Request-Id", "req_login_success"))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isString())
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.expiresIn").value(7200))
                .andExpect(jsonPath("$.data.user.username").value("admin"))
                .andExpect(jsonPath("$.data.permissions[0]").value("dashboard:read"))
                .andExpect(jsonPath("$.error").doesNotExist())
                .andExpect(jsonPath("$.requestId").value("req_login_success"));
    }

    @Test
    void loginRejectsWrongPassword() throws Exception {
        createUser("admin", "CorrectPassword1!", "ACTIVE");

        mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "admin",
                                  "password": "WrongPassword"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data").doesNotExist())
                .andExpect(jsonPath("$.error.code").value("AUTH_INVALID_CREDENTIALS"));
    }

    @Test
    void loginRejectsDisabledUser() throws Exception {
        createUser("disabled-admin", "CorrectPassword1!", "DISABLED");

        mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "disabled-admin",
                                  "password": "CorrectPassword1!"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("AUTH_INVALID_CREDENTIALS"));
    }

    @Test
    void adminApiRejectsMissingToken() throws Exception {
        mockMvc.perform(get("/api/admin/auth/me")
                        .header("X-Request-Id", "req_missing_token"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string("X-Request-Id", "req_missing_token"))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("AUTH_UNAUTHORIZED"))
                .andExpect(jsonPath("$.requestId").value("req_missing_token"));
    }

    @Test
    void adminApiAllowsValidToken() throws Exception {
        createUser("admin", "CorrectPassword1!", "ACTIVE");
        String token = loginToken("admin", "CorrectPassword1!");

        mockMvc.perform(get("/api/admin/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("admin"))
                .andExpect(jsonPath("$.data.displayName").value("admin"));
    }

    @Test
    void adminApiRejectsInvalidToken() throws Exception {
        mockMvc.perform(get("/api/admin/auth/me")
                        .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("AUTH_UNAUTHORIZED"));
    }

    @Test
    void permissionCheckAllowsUserWithPermissionFromRole() throws Exception {
        createUser("admin", "CorrectPassword1!", "ACTIVE");
        createRoleWithPermission("ADMIN", "dashboard:read");
        linkUserRole("admin", "ADMIN");
        String token = loginToken("admin", "CorrectPassword1!");

        mockMvc.perform(get("/api/admin/auth/permission-check")
                        .param("permission", "dashboard:read")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.permission").value("dashboard:read"))
                .andExpect(jsonPath("$.data.allowed").value(true));
    }

    @Test
    void permissionCheckRejectsUserWithoutPermission() throws Exception {
        createUser("sales", "CorrectPassword1!", "ACTIVE");
        createRoleWithPermission("SALES", "lead:read");
        linkUserRole("sales", "SALES");
        String token = loginToken("sales", "CorrectPassword1!");

        mockMvc.perform(get("/api/admin/auth/permission-check")
                        .param("permission", "dashboard:read")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("AUTH_FORBIDDEN"));
    }

    private void createUser(String username, String password, String status) {
        jdbcTemplate.update(
                """
                        insert into sys_user (username, email, password_hash, display_name, status)
                        values (?, ?, ?, ?, ?)
                        """,
                username,
                username + "@example.com",
                passwordEncoder.encode(password),
                username,
                status
        );
    }

    private void createRoleWithPermission(String roleCode, String permissionCode) {
        jdbcTemplate.update(
                "insert into sys_role (code, name) values (?, ?)",
                roleCode,
                roleCode
        );
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
