package com.example.auth.observer;

import com.example.auth.model.User;
import java.time.Instant;

/**
 * Event class for the Observer Pattern implementation.
 * Represents different authentication-related events in the system.
 */
public class AuthEvent {
    
    public enum EventType {
        USER_REGISTERED,
        USER_LOGIN,
        USER_LOGOUT,
        PASSWORD_CHANGED,
        PASSWORD_RESET_REQUESTED,
        PASSWORD_RESET_COMPLETED,
        ACCOUNT_UPDATED,
        ACCOUNT_DELETED
    }
    
    private final EventType type;
    private final User user;
    private final Instant timestamp;
    private final String details;
    
    public AuthEvent(EventType type, User user) {
        this(type, user, null);
    }
    
    public AuthEvent(EventType type, User user, String details) {
        this.type = type;
        this.user = user;
        this.timestamp = Instant.now();
        this.details = details;
    }
    
    public EventType getType() {
        return type;
    }
    
    public User getUser() {
        return user;
    }
    
    public Instant getTimestamp() {
        return timestamp;
    }
    
    public String getDetails() {
        return details;
    }
    
    @Override
    public String toString() {
        return "AuthEvent{" +
                "type=" + type +
                ", user=" + (user != null ? user.getUsername() : "null") +
                ", timestamp=" + timestamp +
                ", details='" + details + '\'' +
                '}';
    }
}