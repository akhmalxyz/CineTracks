package com.example.auth.dto;

import jakarta.validation.constraints.NotEmpty;

public class PasswordResetConfirmRequest {
    
    @NotEmpty(message = "Token is required")
    private String token;
    
    @NotEmpty(message = "New password is required")
    private String newPassword;
    
    public PasswordResetConfirmRequest() {
    }
    
    public PasswordResetConfirmRequest(String token, String newPassword) {
        this.token = token;
        this.newPassword = newPassword;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getNewPassword() {
        return newPassword;
    }
    
    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}