package com.example.auth.observer;

/**
 * Observer interface for the Observer Pattern implementation.
 * Concrete listeners will implement this to react to authentication events.
 */
public interface AuthEventListener {
    
    /**
     * Handle an authentication event
     * @param event The event to handle
     */
    void onEvent(AuthEvent event);
    
    /**
     * Checks if this listener is interested in this type of event
     * @param eventType The type of event
     * @return true if this listener handles this event type
     */
    boolean supports(AuthEvent.EventType eventType);
}