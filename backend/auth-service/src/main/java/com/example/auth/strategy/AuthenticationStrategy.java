package com.example.auth.strategy;

import com.example.auth.model.User;

/**
 * Strategy Pattern: Interface that defines authentication algorithms.
 * Different strategies can be implemented for different types of authentication.
 */
public interface AuthenticationStrategy {
    
    /**
     * Authenticate a user based on the provided credentials
     * @return authenticated user if successful
     * @throws RuntimeException if authentication fails
     */
    User authenticate(String... credentials);
    
    /**
     * Checks if this strategy can handle a particular type of authentication
     */
    boolean supports(String authenticationType);
}