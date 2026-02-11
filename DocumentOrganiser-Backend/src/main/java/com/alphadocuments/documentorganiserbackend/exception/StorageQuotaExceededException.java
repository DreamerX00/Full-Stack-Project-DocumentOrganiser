package com.alphadocuments.documentorganiserbackend.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when storage quota is exceeded.
 */
public class StorageQuotaExceededException extends BaseException {

    public StorageQuotaExceededException(String message) {
        super(message, HttpStatus.PAYLOAD_TOO_LARGE, "STORAGE_QUOTA_EXCEEDED");
    }

    public StorageQuotaExceededException(long available, long required) {
        super(String.format("Storage quota exceeded. Available: %d bytes, Required: %d bytes", available, required),
              HttpStatus.PAYLOAD_TOO_LARGE, "STORAGE_QUOTA_EXCEEDED");
    }
}
