package com.example.auth.adapter;

import com.example.auth.model.User;

/**
 * Adapter Pattern: Interface to adapt different authentication providers
 * to a common interface for the application to use.
 */
public interface AuthProviderAdapter {
    
    /**
     * Authenticates a user with the provider
     * @return authenticated user details
     */
    User authenticate(String credentials);
    
    /**
     * Creates a new user account with the provider
     */
    User createAccount(String username, String email, String password);
    
    /**
     * Gets provider specific user information
     */
    User getUserInfo(String userId);
    
    /**
     * Returns the name of the provider
     */
    String getProviderName();
}