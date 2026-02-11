package com.alphadocuments.documentorganiserbackend.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when file operation fails.
 */
public class FileOperationException extends BaseException {

    public FileOperationException(String message) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR, "FILE_OPERATION_FAILED");
    }

    public FileOperationException(String message, Throwable cause) {
        super(message, cause, HttpStatus.INTERNAL_SERVER_ERROR, "FILE_OPERATION_FAILED");
    }
}
