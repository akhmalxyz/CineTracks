package com.example.auth.service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.auth.config.JwtUtil;
import com.example.auth.dto.UpdateProfileRequest;
import com.example.auth.factory.UserFactory;
import com.example.auth.model.Role;
import com.example.auth.model.User;
import com.example.auth.observer.AuthEvent;
import com.example.auth.observer.AuthEventPublisher;
import com.example.auth.repository.UserRepository;
import com.example.auth.strategy.AuthenticationStrategy;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserFactory userFactory;
    
    @Autowired
    private AuthEventPublisher eventPublisher;
    
    @Autowired
    private List<AuthenticationStrategy> authStrategies;
    
    @Value("${app.password-reset.expiry:3600000}")
    private long passwordResetTokenExpiry;

    public String registerUser(User user) {
        try {
            if (findByUsername(user.getUsername()).isPresent()) {
                throw new IllegalArgumentException("Username already taken");
            }
            
            // Handle if email already exists (if provided)
            if (user.getEmail() != null && !user.getEmail().isEmpty() && 
                userRepository.findByEmail(user.getEmail()).isPresent()) {
                throw new IllegalArgumentException("Email already registered");
            }
            
            // Using Factory Method Pattern to create the user with appropriate defaults
            User newUser = userFactory.createRegularUser(
                user.getUsername(),
                user.getEmail(),
                user.getPassword()
            );
            
            User savedUser = userRepository.save(newUser);
            
            // Using Observer Pattern to notify about user registration
            eventPublisher.publishEvent(new AuthEvent(AuthEvent.EventType.USER_REGISTERED, savedUser));
            
            return jwtUtil.generateToken(savedUser.getUsername());
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Database exception: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }
    
    public String registerGuestUser() {
        try {
            // Using Factory Method Pattern to create a guest user
            User guestUser = userFactory.createGuestUser();
            
            User savedUser = userRepository.save(guestUser);
            
            // Using Observer Pattern to notify about guest user registration
            eventPublisher.publishEvent(new AuthEvent(AuthEvent.EventType.USER_REGISTERED, savedUser, "Guest account"));
            
            return jwtUtil.generateToken(savedUser.getUsername());
        } catch (Exception e) {
            throw new RuntimeException("Guest registration failed: " + e.getMessage());
        }
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public String loginUser(String username, String rawPassword) {
        // Using Strategy pattern to select the appropriate authentication method
        User user = null;
        for (AuthenticationStrategy strategy : authStrategies) {
            if (strategy.supports("username_password")) {
                try {
                    user = strategy.authenticate(username, rawPassword);
                    break;
                } catch (RuntimeException e) {
                    // Try the next strategy
                }
            }
        }
        
        if (user == null) {
            throw new RuntimeException("Invalid username or password");
        }
        
        // Using Observer Pattern to notify about login event
        eventPublisher.publishEvent(new AuthEvent(AuthEvent.EventType.USER_LOGIN, user));
        
        return jwtUtil.generateToken(user.getUsername());
    }

    @Transactional  
    public String updateUser(String username, User userUpdate) {
        try {
            User existingUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            // Check if new username already exists
            if (!existingUser.getUsername().equals(userUpdate.getUsername()) && 
                userRepository.findByUsername(userUpdate.getUsername()).isPresent()) {
                throw new IllegalArgumentException("Username already exists");
            }
            
            // Only update password if provided
            if (userUpdate.getPassword() != null && !userUpdate.getPassword().isEmpty()) {
                existingUser.setPassword(passwordEncoder.encode(userUpdate.getPassword()));
            }
            
            // Update only provided fields
            if (userUpdate.getUsername() != null && !userUpdate.getUsername().isEmpty()) {
                existingUser.setUsername(userUpdate.getUsername());
            }
            
            if (userUpdate.getEmail() != null && !userUpdate.getEmail().isEmpty() &&
                !userUpdate.getEmail().equals(existingUser.getEmail())) {
                // Check if email is already in use
                if (userRepository.findByEmail(userUpdate.getEmail()).isPresent()) {
                    throw new IllegalArgumentException("Email already in use");
                }
                existingUser.setEmail(userUpdate.getEmail());
            }
            
            User updatedUser = userRepository.save(existingUser);
            
            // Using Observer Pattern to notify about account update
            eventPublisher.publishEvent(new AuthEvent(AuthEvent.EventType.ACCOUNT_UPDATED, updatedUser));
            
            return jwtUtil.generateToken(updatedUser.getUsername());
            
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Username already exists: " + e.getMessage());
        }
    }
    
    @Transactional
    public void updateUserProfile(String username, UpdateProfileRequest profileUpdate) {
        User existingUser = userRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Update username if provided
        if (profileUpdate.getUsername() != null && !profileUpdate.getUsername().isEmpty() &&
            !profileUpdate.getUsername().equals(existingUser.getUsername())) {
            // Check if username is already in use
            if (userRepository.findByUsername(profileUpdate.getUsername()).isPresent()) {
                throw new IllegalArgumentException("Username already in use");
            }
            existingUser.setUsername(profileUpdate.getUsername());
        }
        
        // Update email if provided
        if (profileUpdate.getEmail() != null && !profileUpdate.getEmail().isEmpty() && 
            !profileUpdate.getEmail().equals(existingUser.getEmail())) {
            // Check if email is already in use
            if (userRepository.findByEmail(profileUpdate.getEmail()).isPresent()) {
                throw new IllegalArgumentException("Email already in use");
            }
            existingUser.setEmail(profileUpdate.getEmail());
        }
        
        User updatedUser = userRepository.save(existingUser);
        
        // Using Observer Pattern to notify about profile update
        eventPublisher.publishEvent(new AuthEvent(AuthEvent.EventType.ACCOUNT_UPDATED, updatedUser));
    }

    @Transactional
    public boolean deleteUser(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        userRepository.delete(user);
        
        // Using Observer Pattern to notify about account deletion
        eventPublisher.publishEvent(new AuthEvent(AuthEvent.EventType.ACCOUNT_DELETED, user));
        
        return true;
    }
    
    @Transactional
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("Email not found"));
        
        // Generate a unique reset token
        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(Instant.now().toEpochMilli() + passwordResetTokenExpiry); // 1 hour expiry
        
        User updatedUser = userRepository.save(user);
        
        // Using Observer Pattern to notify about password reset request
        eventPublisher.publishEvent(new AuthEvent(
            AuthEvent.EventType.PASSWORD_RESET_REQUESTED, 
            updatedUser, 
            "Reset token: " + resetToken
        ));
        
        // In a real application, you would send an email here with the resetToken
        // For this demo, we'll just save it to the database
    }
    
    @Transactional
    public void confirmPasswordReset(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
            .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token"));
        
        // Check if token is expired
        if (user.getResetTokenExpiry() < Instant.now().toEpochMilli()) {
            throw new IllegalArgumentException("Token expired");
        }
        
        // Reset the password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        
        User updatedUser = userRepository.save(user);
        
        // Using Observer Pattern to notify about password reset completion
        eventPublisher.publishEvent(new AuthEvent(
            AuthEvent.EventType.PASSWORD_RESET_COMPLETED, 
            updatedUser
        ));
    }
    
    @Transactional
    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        User updatedUser = userRepository.save(user);
        
        // Using Observer Pattern to notify about password change
        eventPublisher.publishEvent(new AuthEvent(
            AuthEvent.EventType.PASSWORD_CHANGED, 
            updatedUser
        ));
    }
    
    @Transactional
    public String upgradeGuestToUser(String guestUsername, String username, String email, String password) {
        User guestUser = userRepository.findByUsername(guestUsername)
            .orElseThrow(() -> new IllegalArgumentException("Guest user not found"));
        
        // Verify this is a guest account
        if (guestUser.getRole() != Role.GUEST) {
            throw new IllegalArgumentException("Not a guest account");
        }
        
        // Check if new username already exists
        if (!guestUser.getUsername().equals(username) && 
            userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        
        // Check if email already exists
        if (email != null && !email.isEmpty() && 
            userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }
        
        // Update guest user to regular user
        guestUser.setUsername(username);
        guestUser.setEmail(email);
        guestUser.setPassword(passwordEncoder.encode(password));
        guestUser.setRole(Role.USER);
        
        User upgradedUser = userRepository.save(guestUser);
        
        // Using Observer Pattern to notify about account upgrade
        eventPublisher.publishEvent(new AuthEvent(
            AuthEvent.EventType.ACCOUNT_UPDATED, 
            upgradedUser,
            "Upgraded from guest account"
        ));
        
        // Return new token with updated username
        return jwtUtil.generateToken(upgradedUser.getUsername());
    }
    
    @Transactional
    public String upgradeGuestToUser(String guestUsername, User userDetails) {
        return upgradeGuestToUser(guestUsername, userDetails.getUsername(), userDetails.getEmail(), userDetails.getPassword());
    }
}