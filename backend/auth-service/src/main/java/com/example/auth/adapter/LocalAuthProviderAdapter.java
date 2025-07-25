package com.example.auth.adapter;

import com.example.auth.model.AuthProvider;
import com.example.auth.model.Role;
import com.example.auth.model.User;
import com.example.auth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Concrete implementation of AuthProviderAdapter for local authentication.
 * Adapts our regular DB authentication to the common interface.
 */
@Component
public class LocalAuthProviderAdapter implements AuthProviderAdapter {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public LocalAuthProviderAdapter(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    @Override
    public User authenticate(String credentials) {
        // Parse credentials (username:password format for this simple example)
        String[] parts = credentials.split(":");
        if (parts.length != 2) {
            throw new IllegalArgumentException("Invalid credentials format");
        }
        
        String username = parts[0];
        String password = parts[1];
        
        // Authenticate user
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                return user;
            }
        }
        throw new RuntimeException("Invalid username or password");
    }
    
    @Override
    public User createAccount(String username, String email, String password) {
        // Check if username already exists
        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username already taken");
        }
        
        // Check if email already exists
        if (email != null && !email.isEmpty() && 
            userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }
        
        // Create and save new user
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(Role.USER);
        user.setProvider(AuthProvider.LOCAL);
        
        return userRepository.save(user);
    }
    
    @Override
    public User getUserInfo(String userId) {
        try {
            Long id = Long.parseLong(userId);
            return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        } catch (NumberFormatException e) {
            // If userId is not a number, try username
            return userRepository.findByUsername(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        }
    }
    
    @Override
    public String getProviderName() {
        return AuthProvider.LOCAL.name();
    }
}