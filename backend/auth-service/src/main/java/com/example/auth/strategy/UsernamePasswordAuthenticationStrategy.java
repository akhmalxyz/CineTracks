package com.example.auth.strategy;

import com.example.auth.model.User;
import com.example.auth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Concrete Strategy for username/password authentication
 */
@Component
public class UsernamePasswordAuthenticationStrategy implements AuthenticationStrategy {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public UsernamePasswordAuthenticationStrategy(UserRepository userRepository, 
                                                PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User authenticate(String... credentials) {
        if (credentials.length < 2) {
            throw new IllegalArgumentException("Username and password are required");
        }
        
        String username = credentials[0];
        String password = credentials[1];
        
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
    public boolean supports(String authenticationType) {
        return "username_password".equals(authenticationType);
    }
}