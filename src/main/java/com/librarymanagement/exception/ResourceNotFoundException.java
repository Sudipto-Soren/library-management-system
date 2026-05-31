package com.librarymanagement.exception;

/**
 * Exception thrown when a requested resource is not found in the system.
 * Results in a 404 Not Found HTTP response.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
