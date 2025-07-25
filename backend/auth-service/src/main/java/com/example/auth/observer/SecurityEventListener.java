package com.example.auth.observer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Concrete observer implementation focused on security events.
 * This listener only cares about security-critical auth events.
 */
@Component
public class SecurityEventListener implements AuthEventListener {
    
    private static final Logger securityLogger = LoggerFactory.getLogger("SECURITY_AUDIT");
    
    @Override
    public void onEvent(AuthEvent event) {
        switch (event.getType()) {
            case PASSWORD_CHANGED:
                securityLogger.warn("SECURITY: Password changed for user: {} at {}", 
                    event.getUser().getUsername(), event.getTimestamp());
                break;
            case PASSWORD_RESET_REQUESTED:
                securityLogger.warn("SECURITY: Password reset requested for user: {} at {}", 
                    event.getUser().getUsername(), event.getTimestamp());
                break;
            case PASSWORD_RESET_COMPLETED:
                securityLogger.warn("SECURITY: Password reset completed for user: {} at {}", 
                    event.getUser().getUsername(), event.getTimestamp());
                break;
            case ACCOUNT_DELETED:
                securityLogger.warn("SECURITY: Account deleted for user: {} at {}", 
                    event.getUser().getUsername(), event.getTimestamp());
                break;
            default:
                // Ignore other events
                break;
        }
    }
    
    @Override
    public boolean supports(AuthEvent.EventType eventType) {
        // This listener only supports security-critical events
        return eventType == AuthEvent.EventType.PASSWORD_CHANGED || 
               eventType == AuthEvent.EventType.PASSWORD_RESET_REQUESTED ||
               eventType == AuthEvent.EventType.PASSWORD_RESET_COMPLETED ||
               eventType == AuthEvent.EventType.ACCOUNT_DELETED;
    }
}