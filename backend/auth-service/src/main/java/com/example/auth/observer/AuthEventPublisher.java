package com.example.auth.observer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Observer Pattern: Publisher implementation that notifies all registered listeners
 * when authentication events occur.
 */
@Component
public class AuthEventPublisher {
    
    private final List<AuthEventListener> listeners;
    
    @Autowired
    public AuthEventPublisher(List<AuthEventListener> listeners) {
        this.listeners = listeners;
    }
    
    /**
     * Publish an event to all interested listeners
     * @param event The event to publish
     */
    public void publishEvent(AuthEvent event) {
        for (AuthEventListener listener : listeners) {
            if (listener.supports(event.getType())) {
                listener.onEvent(event);
            }
        }
    }
}