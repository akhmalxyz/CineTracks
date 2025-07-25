package com.example.auth.dto;

public class UserProfileUpdateRequest {
    private String email;

    public UserProfileUpdateRequest() {
    }

    public UserProfileUpdateRequest(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}