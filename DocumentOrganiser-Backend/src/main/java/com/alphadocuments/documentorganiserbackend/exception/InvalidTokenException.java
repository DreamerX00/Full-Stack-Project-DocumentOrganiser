package com.alphadocuments.documentorganiserbackend.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when token is invalid or expired.
 */
public class InvalidTokenException extends BaseException {

    public InvalidTokenException(String message) {
        super(message, HttpStatus.UNAUTHORIZED, "INVALID_TOKEN");
    }

    public InvalidTokenException() {
        super("Invalid or expired token", HttpStatus.UNAUTHORIZED, "INVALID_TOKEN");
    }
}
