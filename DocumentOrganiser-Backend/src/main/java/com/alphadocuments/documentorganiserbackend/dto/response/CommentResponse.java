package com.alphadocuments.documentorganiserbackend.dto.response;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private UUID id;
    private UUID documentId;
    private String content;
    private String authorName;
    private String authorEmail;
    private String authorProfilePicture;
    private UUID parentId;
    private Integer replyCount;
    private Boolean isEdited;
    private Instant editedAt;
    private Instant createdAt;
}
