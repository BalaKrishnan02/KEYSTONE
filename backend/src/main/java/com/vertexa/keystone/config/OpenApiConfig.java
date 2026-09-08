package com.vertexa.keystone.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
            .info(new Info()
                .title("KEYSTONE - Field Service Management Platform API")
                .description("""
                    **Vertexa Facility Solutions Pvt. Ltd.** - Field Service Management Platform
                    
                    ## Overview
                    KEYSTONE is a comprehensive Field Service Management Platform for managing maintenance
                    operations across multiple customer sites.
                    
                    ## Authentication
                    All endpoints require JWT authentication except `/api/auth/login`.
                    Use the `/api/auth/login` endpoint to obtain a JWT token.
                    Include the token in the `Authorization` header as `Bearer <token>`.
                    
                    ## Roles
                    - **MANAGER**: Full system access, user management, reports, dashboard
                    - **DISPATCHER**: Customer/site/work order management, technician assignment
                    - **TECHNICIAN**: View assigned jobs, log time/parts, update status
                    - **CUSTOMER**: Submit requests, view own organization's work orders
                    """)
                .contact(new Contact()
                    .name("Vertexa Facility Solutions Pvt. Ltd.")
                    .email("support@vertexa.com"))
                .license(new License()
                    .name("Proprietary")
                    .url("https://vertexa.com/license"))
                .version("1.0.0"))
            .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
            .components(new Components()
                .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                    .name(securitySchemeName)
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("JWT authentication token")));
    }
}