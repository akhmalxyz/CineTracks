package com.example.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;

public class PasswordResetRequest {
    
    @NotEmpty(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    public PasswordResetRequest() {
    }
    
    public PasswordResetRequest(String email) {
        this.email = email;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
}