package com.example.auth.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.auth.dto.PasswordResetConfirmRequest;
import com.example.auth.dto.PasswordResetRequest;
import com.example.auth.dto.UpdateProfileRequest;
import com.example.auth.dto.UserDetailsResponse;
import com.example.auth.model.User;
import com.example.auth.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(@RequestBody User user) {
        try {
            String token = userService.registerUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Registration successful",
                    "token", token,
                    "expiresIn", 86400000));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", e.getMessage()));
        }
    }

    @PostMapping("/guest")
    public ResponseEntity<Map<String, Object>> guestAccess() {
        try {
            String token = userService.registerGuestUser();
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Guest access granted",
                    "token", token,
                    "expiresIn", 86400000));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody User user) {
        try {
            String token = userService.loginUser(user.getUsername(), user.getPassword());
            // Get user details to include in response
            Optional<User> userDetails = userService.findByUsername(user.getUsername());
            
            if (userDetails.isPresent()) {
                User userData = userDetails.get();
                Map<String, Object> responseMap = new HashMap<>();
                responseMap.put("message", "Login successful");
                responseMap.put("token", token);
                responseMap.put("expiresIn", 86400000);
                responseMap.put("user", new UserDetailsResponse(
                    userData.getUsername(), 
                    userData.getEmail(), 
                    userData.getRole().toString()
                ));
                
                return ResponseEntity.ok(responseMap);
            } else {
                return ResponseEntity.ok(Map.of(
                        "message", "Login successful",
                        "token", token,
                        "expiresIn", 86400000));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", e.getMessage()));
        }
    }

    @PutMapping("/update-profile")
    public ResponseEntity<Map<String, Object>> updateUserProfile(@Valid @RequestBody UpdateProfileRequest updateRequest) {
        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        try {
            userService.updateUserProfile(username, updateRequest);

            return ResponseEntity.ok(Map.of(
                    "message", "Profile updated successfully"));

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "message", "Username or email already exists",
                    "error", "CONFLICT"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", e.getMessage(),
                    "error", "BAD_REQUEST"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "Failed to update user",
                    "error", "INTERNAL_SERVER_ERROR"));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<Map<String, Object>> getUser() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        Optional<User> userDetails = userService.findByUsername(username);

        if (userDetails.isPresent()) {
            User user = userDetails.get();
            UserDetailsResponse response = new UserDetailsResponse(
                user.getUsername(),
                user.getEmail(),
                user.getRole().toString()
            );
            
            return ResponseEntity.ok(Map.of(
                    "message", "Details obtained successfully",
                    "user", response));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", "User not found",
                    "error", "NOT_FOUND"));
        }
    }

    @DeleteMapping("/delete-account")
    public ResponseEntity<Map<String, Object>> deleteUser() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        try {
            boolean isDeleted = userService.deleteUser(username);
            if (isDeleted) {
                return ResponseEntity.ok(Map.of(
                        "message", "User deleted successfully",
                        "username", username));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", "User not found",
                    "error", "NOT_FOUND"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", "User not found",
                    "error", "NOT_FOUND"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "Failed to delete user",
                    "error", "INTERNAL_SERVER_ERROR"));
        }
    }
    
    @PostMapping("/request-password-reset")
    public ResponseEntity<Map<String, Object>> requestPasswordReset(@RequestBody PasswordResetRequest request) {
        try {
            userService.requestPasswordReset(request.getEmail());
            return ResponseEntity.ok(Map.of(
                    "message", "Password reset instructions sent to email",
                    "email", request.getEmail()));
        } catch (IllegalArgumentException e) {
            // Return 200 even if email not found for security reasons
            return ResponseEntity.ok(Map.of(
                    "message", "If the email exists, reset instructions will be sent"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "Failed to process password reset request"));
        }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> confirmPasswordReset(@RequestBody PasswordResetConfirmRequest request) {
        try {
            userService.confirmPasswordReset(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(Map.of(
                    "message", "Password reset successful"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "Failed to reset password"));
        }
    }
    
    @PutMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody Map<String, String> request) {
        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");
        
        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", "Current password and new password are required"));
        }
        
        try {
            userService.changePassword(username, currentPassword, newPassword);
            return ResponseEntity.ok(Map.of(
                    "message", "Password changed successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "Failed to change password"));
        }
    }
    
    @PostMapping("/upgrade-guest")
    public ResponseEntity<Map<String, Object>> upgradeGuestToUser(@RequestBody Map<String, String> userDetails) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String guestUsername = auth.getName();
        
        String username = userDetails.get("username");
        String email = userDetails.get("email");
        String password = userDetails.get("password");
        
        if (username == null || password == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", "Username and password are required"));
        }
        
        try {
            String token = userService.upgradeGuestToUser(guestUsername, username, email, password);
            return ResponseEntity.ok(Map.of(
                    "message", "Account upgraded successfully",
                    "username", username,
                    "token", token,
                    "expiresIn", 86400000));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "Failed to upgrade account"));
        }
    }
}
