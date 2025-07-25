package com.example.auth.factory;

import com.example.auth.model.AuthProvider;
import com.example.auth.model.Role;
import com.example.auth.model.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Factory Method Pattern implementation for creating different types of users.
 * This class centralizes user creation logic and provides specialized methods
 * for creating different types of users with appropriate defaults.
 */
@Component
public class UserFactory {
    
    private final PasswordEncoder passwordEncoder;
    
    public UserFactory(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }
    
    /**
     * Creates a regular user
     */
    public User createRegularUser(String username, String email, String rawPassword) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(Role.USER);
        user.setProvider(AuthProvider.LOCAL);
        return user;
    }
    
    /**
     * Creates a guest user with a randomly generated username and password
     */
    public User createGuestUser() {
        User user = new User();
        String guestUsername = "guest_" + UUID.randomUUID().toString().substring(0, 8);
        user.setUsername(guestUsername);
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setRole(Role.GUEST);
        user.setProvider(AuthProvider.LOCAL);
        return user;
    }
    
    /**
     * Creates an admin user
     */
    public User createAdminUser(String username, String email, String rawPassword) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(Role.ADMIN);
        user.setProvider(AuthProvider.LOCAL);
        return user;
    }
    
    /**
     * Creates a social login user
     */
    public User createSocialUser(String username, String email, AuthProvider provider) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        // Social users have a placeholder password since auth happens via the provider
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setRole(Role.USER);
        user.setProvider(provider);
        return user;
    }
}