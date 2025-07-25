package com.example.auth;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
//import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@Profile("test")
@EnableAutoConfiguration
@EntityScan(basePackages = "com.example.auth.model")
@EnableJpaRepositories(basePackages = "com.example.auth.repository")
@ComponentScan(
    basePackages = "com.example.auth"
    // excludeFilters = {
    //     @ComponentScan.Filter(
    //         type = FilterType.REGEX,
    //         pattern = "com\\.example\\.auth\\.security\\..*"
    //     ),
    //     @ComponentScan.Filter(
    //         type = FilterType.ASSIGNABLE_TYPE,
    //         classes = com.example.auth.security.SecurityConfig.class
    //     )
    // }
)
public class TestConfig {
    // Configuration for tests
}
