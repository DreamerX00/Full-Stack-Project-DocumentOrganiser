package com.alphadocuments.documentorganiserbackend.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when user doesn't have permission to access a resource.
 */
public class ForbiddenException extends BaseException {

    public ForbiddenException(String message) {
        super(message, HttpStatus.FORBIDDEN, "FORBIDDEN");
    }

    public ForbiddenException() {
        super("You don't have permission to access this resource", HttpStatus.FORBIDDEN, "FORBIDDEN");
    }
}
