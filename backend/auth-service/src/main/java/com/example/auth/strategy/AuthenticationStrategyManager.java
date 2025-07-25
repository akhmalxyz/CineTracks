package com.example.auth.strategy;

import com.example.auth.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthenticationStrategyManager {

    private final List<AuthenticationStrategy> strategies;

    @Autowired
    public AuthenticationStrategyManager(List<AuthenticationStrategy> strategies) {
        this.strategies = strategies;
    }

    public User authenticate(String type, String... credentials) {
        // Find the appropriate strategy
        AuthenticationStrategy strategy = strategies.stream()
                .filter(s -> s.supports(type))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported authentication type: " + type));
        
        // Use LSP - any strategy can be used here
        return strategy.authenticate(credentials);
    }
}