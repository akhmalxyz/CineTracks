package com.example.auth.facade;

import com.example.auth.adapter.AuthProviderAdapter;
import com.example.auth.config.JwtUtil;
import com.example.auth.dto.UserDetailsResponse;
import com.example.auth.model.AuthProvider;
import com.example.auth.model.User;
import com.example.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Facade Pattern implementation for authentication.
 * Provides a simplified interface for the complex authentication subsystem.
 */
@Component
public class AuthenticationFacade {
    
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final ApplicationContext context;
    private final Map<AuthProvider, AuthProviderAdapter> providerAdapters = new HashMap<>();
    
    @Autowired
    public AuthenticationFacade(JwtUtil jwtUtil, UserRepository userRepository, ApplicationContext context) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.context = context;
    }
    
    /**
     * Login a user with username and password
     * @return a map containing token and user info
     */
    public Map<String, Object> login(String username, String password) {
        // Find the right adapter for local authentication
        AuthProviderAdapter adapter = getProviderAdapter(AuthProvider.LOCAL);
        
        // Use the adapter to authenticate
        User user = adapter.authenticate(username + ":" + password);
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user.getUsername());
        
        // Create response
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("expiresIn", 86400000);
        response.put("user", new UserDetailsResponse(
            user.getUsername(),
            user.getEmail(),
            user.getRole().toString()
        ));
        
        return response;
    }
    
    /**
     * Register a new user
     * @return token for the new user
     */
    public String register(String username, String email, String password) {
        AuthProviderAdapter adapter = getProviderAdapter(AuthProvider.LOCAL);
        User user = adapter.createAccount(username, email, password);
        return jwtUtil.generateToken(user.getUsername());
    }
    
    /**
     * Get user details from a JWT token
     */
    public Optional<User> getUserFromToken(String token) {
        try {
            String username = jwtUtil.extractUsername(token);
            return userRepository.findByUsername(username);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
    
    /**
     * Social login (uses appropriate adapter based on provider)
     */
    public Map<String, Object> socialLogin(AuthProvider provider, String accessToken) {
        AuthProviderAdapter adapter = getProviderAdapter(provider);
        User user = adapter.authenticate(accessToken);
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user.getUsername());
        
        // Create response
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("expiresIn", 86400000);
        response.put("user", new UserDetailsResponse(
            user.getUsername(),
            user.getEmail(),
            user.getRole().toString()
        ));
        
        return response;
    }
    
    // Helper method to get the appropriate provider adapter
    private AuthProviderAdapter getProviderAdapter(AuthProvider provider) {
        if (!providerAdapters.containsKey(provider)) {
            // Lazy initialization of adapters
            String adapterBeanName = provider.name().toLowerCase() + "AuthProviderAdapter";
            AuthProviderAdapter adapter = (AuthProviderAdapter) context.getBean(adapterBeanName);
            providerAdapters.put(provider, adapter);
        }
        return providerAdapters.get(provider);
    }
}