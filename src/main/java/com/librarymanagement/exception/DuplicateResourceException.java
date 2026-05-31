package com.librarymanagement.exception;

/**
 * Exception thrown when attempting to create a resource that already exists.
 * For example, registering with an email that is already in use.
 * Results in a 409 Conflict HTTP response.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
