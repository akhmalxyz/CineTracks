package com.example.auth.builder;

import com.example.auth.model.AuthProvider;
import com.example.auth.model.Role;
import com.example.auth.model.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Builder Pattern implementation for creating User objects.
 * Provides a fluent interface for constructing User objects with complex configuration.
 */
@Component
public class UserBuilder {
    
    private final PasswordEncoder passwordEncoder;
    private User user;
    
    public UserBuilder(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }
    
    public UserBuilder createNew() {
        this.user = new User();
        return this;
    }
    
    public UserBuilder withUsername(String username) {
        this.user.setUsername(username);
        return this;
    }
    
    public UserBuilder withEmail(String email) {
        this.user.setEmail(email);
        return this;
    }
    
    public UserBuilder withRawPassword(String password) {
        this.user.setPassword(passwordEncoder.encode(password));
        return this;
    }
    
    public UserBuilder withEncodedPassword(String encodedPassword) {
        this.user.setPassword(encodedPassword);
        return this;
    }
    
    public UserBuilder withRole(Role role) {
        this.user.setRole(role);
        return this;
    }
    
    public UserBuilder withAuthProvider(AuthProvider provider) {
        this.user.setProvider(provider);
        return this;
    }
    
    public UserBuilder withResetToken(String resetToken) {
        this.user.setResetToken(resetToken);
        return this;
    }
    
    public UserBuilder withResetTokenExpiry(Long expiryTimestamp) {
        this.user.setResetTokenExpiry(expiryTimestamp);
        return this;
    }
    
    public User build() {
        // Validate the user object has minimum required fields
        if (this.user.getUsername() == null || this.user.getUsername().isEmpty()) {
            throw new IllegalStateException("Username cannot be null or empty");
        }
        
        if (this.user.getPassword() == null || this.user.getPassword().isEmpty()) {
            throw new IllegalStateException("Password cannot be null or empty");
        }
        
        // Set defaults if not specified
        if (this.user.getRole() == null) {
            this.user.setRole(Role.USER);
        }
        
        if (this.user.getProvider() == null) {
            this.user.setProvider(AuthProvider.LOCAL);
        }
        
        return this.user;
    }
}