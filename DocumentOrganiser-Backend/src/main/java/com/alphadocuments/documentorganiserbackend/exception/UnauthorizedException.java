package com.alphadocuments.documentorganiserbackend.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when user is not authorized to perform an action.
 */
public class UnauthorizedException extends BaseException {

    public UnauthorizedException(String message) {
        super(message, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED");
    }

    public UnauthorizedException() {
        super("You are not authorized to perform this action", HttpStatus.UNAUTHORIZED, "UNAUTHORIZED");
    }
}
