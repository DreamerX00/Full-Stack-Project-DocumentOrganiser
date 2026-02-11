package com.alphadocuments.documentorganiserbackend.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when file type is not allowed.
 */
public class InvalidFileTypeException extends BaseException {

    public InvalidFileTypeException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "INVALID_FILE_TYPE");
    }

    public InvalidFileTypeException(String fileType, String allowedTypes) {
        super(String.format("File type '%s' is not allowed. Allowed types: %s", fileType, allowedTypes),
              HttpStatus.BAD_REQUEST, "INVALID_FILE_TYPE");
    }
}
