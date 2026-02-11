package com.alphadocuments.documentorganiserbackend.util;

import com.alphadocuments.documentorganiserbackend.entity.enums.DocumentCategory;
import org.apache.tika.Tika;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;
import java.util.Set;

/**
 * Utility class for file type detection and categorization.
 */
@Component
public class FileTypeUtil {

    private final Tika tika = new Tika();

    private static final Map<String, Set<String>> CATEGORY_EXTENSIONS = Map.of(
            "DOCUMENTS", Set.of("pdf", "doc", "docx", "txt", "rtf", "odt", "xps", "epub", "md"),
            "IMAGES", Set.of("jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "ico", "tiff", "tif", "heic", "heif"),
            "VIDEOS", Set.of("mp4", "avi", "mkv", "mov", "wmv", "flv", "webm", "m4v", "mpeg", "mpg", "3gp"),
            "AUDIO", Set.of("mp3", "wav", "flac", "aac", "ogg", "wma", "m4a", "aiff", "opus"),
            "ARCHIVES", Set.of("zip", "rar", "7z", "tar", "gz", "bz2", "xz", "iso"),
            "SPREADSHEETS", Set.of("xls", "xlsx", "csv", "ods", "numbers"),
            "PRESENTATIONS", Set.of("ppt", "pptx", "odp", "key"),
            "CODE", Set.of("java", "py", "js", "ts", "html", "css", "json", "xml", "sql", "sh", "bash",
                          "c", "cpp", "h", "go", "rs", "rb", "php", "swift", "kt", "scala", "yaml", "yml")
    );

    private static final Map<String, Set<String>> CATEGORY_MIME_PREFIXES = Map.of(
            "IMAGES", Set.of("image/"),
            "VIDEOS", Set.of("video/"),
            "AUDIO", Set.of("audio/"),
            "DOCUMENTS", Set.of("application/pdf", "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml"),
            "SPREADSHEETS", Set.of("application/vnd.ms-excel",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml"),
            "PRESENTATIONS", Set.of("application/vnd.ms-powerpoint",
                    "application/vnd.openxmlformats-officedocument.presentationml"),
            "ARCHIVES", Set.of("application/zip", "application/x-rar", "application/x-7z",
                    "application/x-tar", "application/gzip")
    );

    /**
     * Detect MIME type from input stream.
     */
    public String detectMimeType(InputStream inputStream) throws IOException {
        return tika.detect(inputStream);
    }

    /**
     * Detect MIME type from file name.
     */
    public String detectMimeType(String fileName) {
        return tika.detect(fileName);
    }

    /**
     * Detect MIME type from MultipartFile.
     */
    public String detectMimeType(MultipartFile file) throws IOException {
        String mimeType = file.getContentType();
        if (mimeType == null || mimeType.equals("application/octet-stream")) {
            mimeType = tika.detect(file.getInputStream());
        }
        return mimeType;
    }

    /**
     * Get file extension from filename.
     */
    public String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }

    /**
     * Categorize document based on file extension and MIME type.
     */
    public DocumentCategory categorizeDocument(String fileName, String mimeType) {
        String extension = getFileExtension(fileName).toLowerCase();

        // Try extension-based categorization first
        for (Map.Entry<String, Set<String>> entry : CATEGORY_EXTENSIONS.entrySet()) {
            if (entry.getValue().contains(extension)) {
                return DocumentCategory.valueOf(entry.getKey());
            }
        }

        // Fallback to MIME type based categorization
        if (mimeType != null) {
            for (Map.Entry<String, Set<String>> entry : CATEGORY_MIME_PREFIXES.entrySet()) {
                for (String prefix : entry.getValue()) {
                    if (mimeType.startsWith(prefix) || mimeType.contains(prefix)) {
                        return DocumentCategory.valueOf(entry.getKey());
                    }
                }
            }
        }

        return DocumentCategory.OTHERS;
    }

    /**
     * Get file name without extension.
     */
    public String getFileNameWithoutExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return fileName;
        }
        return fileName.substring(0, fileName.lastIndexOf("."));
    }

    /**
     * Generate a safe file name (remove special characters).
     */
    public String sanitizeFileName(String fileName) {
        if (fileName == null) {
            return "unnamed";
        }
        // Replace special characters with underscores
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    /**
     * Check if file type is allowed.
     */
    public boolean isAllowedFileType(String mimeType, Set<String> allowedMimeTypes) {
        if (allowedMimeTypes == null || allowedMimeTypes.isEmpty()) {
            return true; // Allow all if no restrictions
        }
        return allowedMimeTypes.stream()
                .anyMatch(allowed -> mimeType.startsWith(allowed) || mimeType.equals(allowed));
    }
}
