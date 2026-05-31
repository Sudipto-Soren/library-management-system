package com.librarymanagement.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI / Swagger UI configuration.
 * Configures API metadata and JWT Bearer authentication scheme so that
 * the Swagger UI includes an "Authorize" button for testing secured endpoints.
 */
@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "Bearer Authentication";

    /**
     * Builds and returns a customised {@link OpenAPI} descriptor.
     *
     * @return the configured OpenAPI bean
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                // -- API metadata --
                .info(new Info()
                        .title("Library Management System API")
                        .version("1.0")
                        .description("A comprehensive RESTful API for managing a library system. "
                                + "Supports book cataloguing, user management, and book issue/return operations "
                                + "with role-based access control.")
                        .contact(new Contact()
                                .name("Library Management Team")
                                .email("admin@librarymanagement.com")
                                .url("https://github.com/library-management"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))

                // -- Global security requirement (all endpoints require JWT by default) --
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))

                // -- Security scheme definition --
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, new SecurityScheme()
                                .name(SECURITY_SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter your JWT token in the format: Bearer {token}")));
    }
}
