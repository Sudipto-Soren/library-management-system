package com.librarymanagement.exception;

/**
 * Exception thrown when a client sends an invalid or malformed request.
 * Results in a 400 Bad Request HTTP response.
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
