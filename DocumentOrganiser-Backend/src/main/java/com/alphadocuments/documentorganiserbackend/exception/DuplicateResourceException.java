package com.alphadocuments.documentorganiserbackend.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when a resource already exists.
 */
public class DuplicateResourceException extends BaseException {

    public DuplicateResourceException(String message) {
        super(message, HttpStatus.CONFLICT, "DUPLICATE_RESOURCE");
    }

    public DuplicateResourceException(String resourceType, String identifier) {
        super(String.format("%s already exists with identifier: %s", resourceType, identifier),
              HttpStatus.CONFLICT, "DUPLICATE_RESOURCE");
    }
}
