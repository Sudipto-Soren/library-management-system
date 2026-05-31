package com.librarymanagement.exception;

/**
 * Exception thrown when a book is not available for issuing.
 * This occurs when all copies of a book are currently issued out.
 * Results in a 409 Conflict HTTP response.
 */
public class BookUnavailableException extends RuntimeException {

    public BookUnavailableException(String message) {
        super(message);
    }
}
