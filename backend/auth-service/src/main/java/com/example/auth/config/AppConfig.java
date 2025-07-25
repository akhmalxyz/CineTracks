package com.example.auth.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@Configuration
@EnableConfigurationProperties(JwtProperties.class)
public class AppConfig{
    
}
