package com.alphadocuments.documentorganiserbackend.service.impl;

import com.alphadocuments.documentorganiserbackend.config.StorageProperties;
import com.alphadocuments.documentorganiserbackend.exception.FileOperationException;
import com.alphadocuments.documentorganiserbackend.service.StorageService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.io.InputStream;
import java.net.URI;
import java.time.Duration;

/**
 * Implementation of StorageService using AWS S3 / MinIO.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StorageServiceImpl implements StorageService {

    private final StorageProperties storageProperties;
    private S3Client s3Client;
    private S3Presigner s3Presigner;

    @PostConstruct
    public void init() {
        AwsBasicCredentials credentials = AwsBasicCredentials.create(
                storageProperties.getAccessKey(),
                storageProperties.getSecretKey()
        );

        var clientBuilder = S3Client.builder()
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .region(Region.of(storageProperties.getRegion()));

        var presignerBuilder = S3Presigner.builder()
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .region(Region.of(storageProperties.getRegion()));

        // For MinIO or custom S3 endpoints
        if (storageProperties.getEndpoint() != null && !storageProperties.getEndpoint().isEmpty()) {
            URI endpointUri = URI.create(storageProperties.getEndpoint());
            clientBuilder.endpointOverride(endpointUri).forcePathStyle(true);
            presignerBuilder.endpointOverride(endpointUri);
        }

        this.s3Client = clientBuilder.build();
        this.s3Presigner = presignerBuilder.build();

        initializeBucket();
    }

    @Override
    public String uploadFile(String key, InputStream inputStream, long contentLength, String contentType) {
        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(storageProperties.getBucketName())
                    .key(key)
                    .contentType(contentType)
                    .contentLength(contentLength)
                    .build();

            s3Client.putObject(request, RequestBody.fromInputStream(inputStream, contentLength));
            log.info("Uploaded file: {}", key);
            return key;
        } catch (Exception e) {
            log.error("Failed to upload file: {}", key, e);
            throw new FileOperationException("Failed to upload file", e);
        }
    }

    @Override
    public InputStream downloadFile(String key) {
        try {
            GetObjectRequest request = GetObjectRequest.builder()
                    .bucket(storageProperties.getBucketName())
                    .key(key)
                    .build();

            return s3Client.getObject(request);
        } catch (NoSuchKeyException e) {
            log.error("File not found: {}", key);
            throw new FileOperationException("File not found: " + key);
        } catch (Exception e) {
            log.error("Failed to download file: {}", key, e);
            throw new FileOperationException("Failed to download file", e);
        }
    }

    @Override
    public void deleteFile(String key) {
        try {
            DeleteObjectRequest request = DeleteObjectRequest.builder()
                    .bucket(storageProperties.getBucketName())
                    .key(key)
                    .build();

            s3Client.deleteObject(request);
            log.info("Deleted file: {}", key);
        } catch (Exception e) {
            log.error("Failed to delete file: {}", key, e);
            throw new FileOperationException("Failed to delete file", e);
        }
    }

    @Override
    public String copyFile(String sourceKey, String destinationKey) {
        try {
            CopyObjectRequest request = CopyObjectRequest.builder()
                    .sourceBucket(storageProperties.getBucketName())
                    .sourceKey(sourceKey)
                    .destinationBucket(storageProperties.getBucketName())
                    .destinationKey(destinationKey)
                    .build();

            s3Client.copyObject(request);
            log.info("Copied file from {} to {}", sourceKey, destinationKey);
            return destinationKey;
        } catch (Exception e) {
            log.error("Failed to copy file from {} to {}", sourceKey, destinationKey, e);
            throw new FileOperationException("Failed to copy file", e);
        }
    }

    @Override
    public boolean fileExists(String key) {
        try {
            HeadObjectRequest request = HeadObjectRequest.builder()
                    .bucket(storageProperties.getBucketName())
                    .key(key)
                    .build();

            s3Client.headObject(request);
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        } catch (Exception e) {
            log.error("Error checking file existence: {}", key, e);
            return false;
        }
    }

    @Override
    public String generatePresignedDownloadUrl(String key, Duration expiration) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(storageProperties.getBucketName())
                    .key(key)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(expiration)
                    .getObjectRequest(getObjectRequest)
                    .build();

            return s3Presigner.presignGetObject(presignRequest).url().toString();
        } catch (Exception e) {
            log.error("Failed to generate presigned download URL: {}", key, e);
            throw new FileOperationException("Failed to generate download URL", e);
        }
    }

    @Override
    public String generatePresignedUploadUrl(String key, String contentType, Duration expiration) {
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(storageProperties.getBucketName())
                    .key(key)
                    .contentType(contentType)
                    .build();

            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(expiration)
                    .putObjectRequest(putObjectRequest)
                    .build();

            return s3Presigner.presignPutObject(presignRequest).url().toString();
        } catch (Exception e) {
            log.error("Failed to generate presigned upload URL: {}", key, e);
            throw new FileOperationException("Failed to generate upload URL", e);
        }
    }

    @Override
    public void initializeBucket() {
        try {
            HeadBucketRequest headBucketRequest = HeadBucketRequest.builder()
                    .bucket(storageProperties.getBucketName())
                    .build();

            s3Client.headBucket(headBucketRequest);
            log.info("Bucket '{}' exists", storageProperties.getBucketName());
        } catch (NoSuchBucketException e) {
            log.info("Creating bucket: {}", storageProperties.getBucketName());
            CreateBucketRequest createBucketRequest = CreateBucketRequest.builder()
                    .bucket(storageProperties.getBucketName())
                    .build();

            s3Client.createBucket(createBucketRequest);
            log.info("Bucket '{}' created successfully", storageProperties.getBucketName());
        } catch (Exception e) {
            log.warn("Could not verify bucket existence: {}", e.getMessage());
        }
    }
}
