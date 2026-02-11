package com.alphadocuments.documentorganiserbackend.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when there's a validation error.
 */
public class ValidationException extends BaseException {

    public ValidationException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
    }

    public ValidationException(String field, String message) {
        super(String.format("Validation failed for field '%s': %s", field, message),
              HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
    }
}
