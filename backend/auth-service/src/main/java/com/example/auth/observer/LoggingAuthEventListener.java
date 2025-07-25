package com.example.auth.observer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Concrete implementation of AuthEventListener that logs auth events.
 */
@Component
public class LoggingAuthEventListener implements AuthEventListener {
    
    private static final Logger logger = LoggerFactory.getLogger(LoggingAuthEventListener.class);
    
    @Override
    public void onEvent(AuthEvent event) {
        switch (event.getType()) {
            case USER_REGISTERED:
                logger.info("New user registered: {}", event.getUser().getUsername());
                break;
            case USER_LOGIN:
                logger.info("User logged in: {}", event.getUser().getUsername());
                break;
            case USER_LOGOUT:
                logger.info("User logged out: {}", event.getUser().getUsername());
                break;
            case PASSWORD_CHANGED:
                logger.info("Password changed for user: {}", event.getUser().getUsername());
                break;
            case PASSWORD_RESET_REQUESTED:
                logger.info("Password reset requested for user: {}", event.getUser().getUsername());
                break;
            case PASSWORD_RESET_COMPLETED:
                logger.info("Password reset completed for user: {}", event.getUser().getUsername());
                break;
            case ACCOUNT_UPDATED:
                logger.info("Account updated for user: {}", event.getUser().getUsername());
                break;
            case ACCOUNT_DELETED:
                logger.info("Account deleted for user: {}", event.getUser().getUsername());
                break;
            default:
                logger.info("Unknown event type for user: {}", event.getUser().getUsername());
        }
    }
    
    @Override
    public boolean supports(AuthEvent.EventType eventType) {
        // This listener handles all event types
        return true;
    }
}