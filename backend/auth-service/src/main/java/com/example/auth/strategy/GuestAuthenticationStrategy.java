package com.example.auth.strategy;

import com.example.auth.model.User;
import com.example.auth.model.Role;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.UUID;

@Component
public class GuestAuthenticationStrategy implements AuthenticationStrategy {

    @Override
    public User authenticate(String... credentials) {
        // Create a temporary guest user
        User guestUser = new User();
        guestUser.setId(null); // Will not be persisted
        guestUser.setUsername("guest_" + UUID.randomUUID().toString().substring(0, 8));
        guestUser.setEmail("guest@example.com");
        guestUser.setPassword(""); // No password for guest
        
        return guestUser;
    }

    @Override
    public boolean supports(String authenticationType) {
        return "guest".equals(authenticationType);
    }
}