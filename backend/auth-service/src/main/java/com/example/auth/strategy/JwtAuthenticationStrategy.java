package com.example.auth.strategy;

import com.example.auth.config.JwtUtil;
import com.example.auth.model.User;
import com.example.auth.repository.UserRepository;
import org.springframework.stereotype.Component;

/**
 * Concrete Strategy for JWT token authentication
 */
@Component
public class JwtAuthenticationStrategy implements AuthenticationStrategy {
    
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    
    public JwtAuthenticationStrategy(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    public User authenticate(String... credentials) {
        if (credentials.length < 1) {
            throw new IllegalArgumentException("JWT token is required");
        }
        
        String token = credentials[0];
        
        // Extract username from token
        String username = jwtUtil.extractUsername(token);
        
        if (username != null) {
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
                
            // Validate token for this user
            if (jwtUtil.validateToken(token, username)) {
                return user;
            }
        }
        
        throw new RuntimeException("Invalid or expired JWT token");
    }

    @Override
    public boolean supports(String authenticationType) {
        return "jwt".equals(authenticationType);
    }
}