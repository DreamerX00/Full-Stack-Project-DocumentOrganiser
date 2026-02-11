package com.alphadocuments.documentorganiserbackend.service;

import java.io.InputStream;
import java.time.Duration;

/**
 * Service interface for file storage operations (S3/MinIO).
 */
public interface StorageService {

    /**
     * Upload a file to storage.
     */
    String uploadFile(String key, InputStream inputStream, long contentLength, String contentType);

    /**
     * Download a file from storage.
     */
    InputStream downloadFile(String key);

    /**
     * Delete a file from storage.
     */
    void deleteFile(String key);

    /**
     * Copy a file within storage.
     */
    String copyFile(String sourceKey, String destinationKey);

    /**
     * Check if a file exists.
     */
    boolean fileExists(String key);

    /**
     * Generate a pre-signed URL for downloading.
     */
    String generatePresignedDownloadUrl(String key, Duration expiration);

    /**
     * Generate a pre-signed URL for uploading.
     */
    String generatePresignedUploadUrl(String key, String contentType, Duration expiration);

    /**
     * Initialize the storage bucket if it doesn't exist.
     */
    void initializeBucket();
}
