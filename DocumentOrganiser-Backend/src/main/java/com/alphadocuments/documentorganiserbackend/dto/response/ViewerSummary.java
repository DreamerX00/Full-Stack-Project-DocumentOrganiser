package com.alphadocuments.documentorganiserbackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Summary of a user currently viewing a document.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ViewerSummary {
    private UUID userId;
    private String name;
    private String email;
    private String profilePicture;
}
