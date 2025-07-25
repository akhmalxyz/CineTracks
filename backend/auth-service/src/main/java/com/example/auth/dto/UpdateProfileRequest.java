package com.example.auth.dto;

import jakarta.validation.constraints.Email;

public class UpdateProfileRequest {
    private String username;
    
    @Email(message = "Invalid email format")
    private String email;
    
    public UpdateProfileRequest() {
    }
    
    public UpdateProfileRequest(String username, String email) {
        this.username = username;
        this.email = email;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
}