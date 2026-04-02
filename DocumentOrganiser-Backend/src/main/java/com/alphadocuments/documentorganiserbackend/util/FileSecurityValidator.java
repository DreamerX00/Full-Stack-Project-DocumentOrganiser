package com.alphadocuments.documentorganiserbackend.util;

import com.alphadocuments.documentorganiserbackend.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Set;

/**
 * Utility for validating uploaded files for security.
 * Uses Apache Tika for magic byte detection to prevent MIME type spoofing.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class FileSecurityValidator {

    private final Tika tika = new Tika();

    // Dangerous file types that should never be uploaded
    private static final Set<String> BLOCKED_MIME_TYPES = Set.of(
            "application/x-msdownload",      // .exe
            "application/x-executable",       // Linux executables
            "application/x-msi",              // Windows installers
            "application/x-dosexec",          // DOS executables
            "application/x-sh",               // Shell scripts
            "application/x-shellscript",
            "text/x-shellscript",
            "application/x-bat",              // Batch files
            "application/x-msdos-program",
            "application/vnd.microsoft.portable-executable",
            "application/x-httpd-php",        // PHP files
            "application/x-php",
            "text/x-php",
            "application/java-archive",       // JAR files (executable)
            "application/x-java-applet"
    );

    // File extensions that are always blocked regardless of content
    private static final Set<String> BLOCKED_EXTENSIONS = Set.of(
            "exe", "msi", "bat", "cmd", "com", "scr", "pif",
            "sh", "bash", "zsh", "ksh", "csh",
            "php", "phtml", "php3", "php4", "php5", "phps",
            "jsp", "jspx", "asp", "aspx", "ascx",
            "dll", "so", "dylib",
            "jar", "war", "ear",
            "ps1", "psm1", "psd1",  // PowerShell
            "vbs", "vbe", "wsf", "wsc", "wsh"  // VBScript
    );

    // Maximum file size (100MB by default, can be overridden)
    private static final long MAX_FILE_SIZE = 100 * 1024 * 1024;

    /**
     * Validates an uploaded file for security issues.
     * @throws ValidationException if the file fails validation
     */
    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("File is empty");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new ValidationException("File name is required");
        }

        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ValidationException("File size exceeds maximum allowed (100MB)");
        }

        // Check for blocked extensions
        String extension = getExtension(originalFilename).toLowerCase();
        if (BLOCKED_EXTENSIONS.contains(extension)) {
            log.warn("Blocked file upload attempt with extension: {}", extension);
            throw new ValidationException("File type not allowed: " + extension);
        }

        // Detect actual MIME type using magic bytes
        String detectedMimeType;
        try (InputStream is = file.getInputStream()) {
            detectedMimeType = tika.detect(is);
        } catch (IOException e) {
            log.error("Failed to detect file type", e);
            throw new ValidationException("Unable to validate file type");
        }

        // Check if detected MIME type is blocked
        if (BLOCKED_MIME_TYPES.contains(detectedMimeType)) {
            log.warn("Blocked file upload with detected MIME type: {} (claimed: {})",
                    detectedMimeType, file.getContentType());
            throw new ValidationException("File type not allowed");
        }

        // Check for MIME type mismatch (potential spoofing)
        String claimedMimeType = file.getContentType();
        if (claimedMimeType != null && !claimedMimeType.equals("application/octet-stream")) {
            if (!areMimeTypesCompatible(claimedMimeType, detectedMimeType)) {
                log.warn("MIME type mismatch detected. Claimed: {}, Detected: {}",
                        claimedMimeType, detectedMimeType);
                // Allow but log - some browsers send incorrect MIME types
            }
        }

        // Check for double extensions (e.g., file.pdf.exe)
        if (hasDoubleExtension(originalFilename)) {
            String secondExt = getSecondExtension(originalFilename);
            if (BLOCKED_EXTENSIONS.contains(secondExt.toLowerCase())) {
                log.warn("Blocked double extension attack: {}", originalFilename);
                throw new ValidationException("Invalid file name");
            }
        }

        // Check for null bytes in filename (path traversal attempt)
        if (originalFilename.contains("\0")) {
            log.warn("Null byte detected in filename");
            throw new ValidationException("Invalid file name");
        }

        // Check for path traversal attempts
        if (originalFilename.contains("..") || originalFilename.contains("/") || originalFilename.contains("\\")) {
            log.warn("Path traversal attempt detected: {}", originalFilename);
            throw new ValidationException("Invalid file name");
        }
    }

    /**
     * Get the detected MIME type using magic bytes.
     */
    public String getDetectedMimeType(MultipartFile file) throws IOException {
        try (InputStream is = file.getInputStream()) {
            return tika.detect(is);
        }
    }

    private String getExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        if (lastDot == -1 || lastDot == filename.length() - 1) {
            return "";
        }
        return filename.substring(lastDot + 1);
    }

    private boolean hasDoubleExtension(String filename) {
        int firstDot = filename.indexOf('.');
        int lastDot = filename.lastIndexOf('.');
        return firstDot != -1 && lastDot != -1 && firstDot != lastDot;
    }

    private String getSecondExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        if (lastDot == -1) return "";
        
        String withoutLast = filename.substring(0, lastDot);
        int secondLastDot = withoutLast.lastIndexOf('.');
        if (secondLastDot == -1) return "";
        
        return withoutLast.substring(secondLastDot + 1);
    }

    private boolean areMimeTypesCompatible(String claimed, String detected) {
        // Consider them compatible if they're in the same category
        String claimedCategory = getMimeCategory(claimed);
        String detectedCategory = getMimeCategory(detected);
        return claimedCategory.equals(detectedCategory);
    }

    private String getMimeCategory(String mimeType) {
        if (mimeType == null) return "unknown";
        if (mimeType.startsWith("image/")) return "image";
        if (mimeType.startsWith("video/")) return "video";
        if (mimeType.startsWith("audio/")) return "audio";
        if (mimeType.startsWith("text/")) return "text";
        if (mimeType.contains("pdf")) return "document";
        if (mimeType.contains("word") || mimeType.contains("document")) return "document";
        if (mimeType.contains("excel") || mimeType.contains("spreadsheet")) return "spreadsheet";
        if (mimeType.contains("powerpoint") || mimeType.contains("presentation")) return "presentation";
        if (mimeType.contains("zip") || mimeType.contains("archive") || mimeType.contains("compressed")) return "archive";
        return "other";
    }
}
