package com.example.b2btruck.common.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(ApiResponseIntegrationTests.TestApiController.class)
class ApiResponseIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void wrapsJsonControllerResponses() throws Exception {
        mockMvc.perform(get("/test-api/common/ping").header("X-Request-Id", "req_test"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Request-Id", "req_test"))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.message").value("pong"))
                .andExpect(jsonPath("$.error").doesNotExist())
                .andExpect(jsonPath("$.requestId").value("req_test"));
    }

    @Test
    void keepsPageResponseShapeInsideApiEnvelope() throws Exception {
        mockMvc.perform(get("/test-api/common/page"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items[0]").value("tow-truck"))
                .andExpect(jsonPath("$.data.page").value(1))
                .andExpect(jsonPath("$.data.pageSize").value(20))
                .andExpect(jsonPath("$.data.total").value(1));
    }

    @Test
    void exposesOpenApiAndSwaggerUi() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.openapi").exists());

        mockMvc.perform(get("/swagger-ui/index.html"))
                .andExpect(status().is3xxRedirection());
    }

    @RestController
    @RequestMapping("/test-api/common")
    static class TestApiController {

        @GetMapping("/ping")
        Map<String, String> ping() {
            return Map.of("message", "pong");
        }

        @GetMapping("/page")
        PageResponse<String> page() {
            return new PageResponse<>(List.of("tow-truck"), 1, 20, 1);
        }
    }
}
