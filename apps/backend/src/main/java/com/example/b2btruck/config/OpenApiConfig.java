package com.example.b2btruck.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "B2B Truck Platform API",
                version = "0.1.0",
                description = "Backend APIs for the B2B export truck CMS, CRM, and public site."
        )
)
public class OpenApiConfig {
}
