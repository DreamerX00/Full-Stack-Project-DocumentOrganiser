package com.alphadocuments.documentorganiserbackend.controller;

import com.alphadocuments.documentorganiserbackend.dto.request.CreateCommentRequest;
import com.alphadocuments.documentorganiserbackend.dto.response.ApiResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.CommentResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.PagedResponse;
import com.alphadocuments.documentorganiserbackend.entity.Document;
import com.alphadocuments.documentorganiserbackend.entity.DocumentComment;
import com.alphadocuments.documentorganiserbackend.entity.User;
import com.alphadocuments.documentorganiserbackend.exception.ResourceNotFoundException;
import com.alphadocuments.documentorganiserbackend.repository.DocumentCommentRepository;
import com.alphadocuments.documentorganiserbackend.repository.DocumentRepository;
import com.alphadocuments.documentorganiserbackend.repository.UserRepository;
import com.alphadocuments.documentorganiserbackend.security.CurrentUser;
import com.alphadocuments.documentorganiserbackend.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller for document comments.
 */
@RestController
@RequestMapping("/documents/{documentId}/comments")
@RequiredArgsConstructor
@Tag(name = "Comments", description = "Document comment/annotation APIs")
public class CommentController {

    private final DocumentCommentRepository commentRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "List comments", description = "Get paginated comments for a document")
    public ResponseEntity<ApiResponse<PagedResponse<CommentResponse>>> listComments(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID documentId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<CommentResponse> page = commentRepository
                .findByDocumentIdOrderByCreatedAtDesc(documentId, pageable)
                .map(this::mapToResponse);

        PagedResponse<CommentResponse> response = PagedResponse.<CommentResponse>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @Operation(summary = "Add comment", description = "Add a comment to a document")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID documentId,
            @Valid @RequestBody CreateCommentRequest request) {

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));

        DocumentComment comment = DocumentComment.builder()
                .document(document)
                .user(user)
                .content(request.getContent())
                .build();

        if (request.getParentId() != null) {
            DocumentComment parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", request.getParentId()));
            comment.setParent(parent);
        }

        commentRepository.save(comment);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(mapToResponse(comment), "Comment added"));
    }

    @DeleteMapping("/{commentId}")
    @Operation(summary = "Delete comment", description = "Delete a comment")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID documentId,
            @PathVariable UUID commentId) {

        DocumentComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        // Only the author or admin can delete
        if (!comment.getUser().getId().equals(userPrincipal.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("FORBIDDEN", "You can only delete your own comments"));
        }

        commentRepository.delete(comment);
        return ResponseEntity.ok(ApiResponse.success("Comment deleted"));
    }

    private CommentResponse mapToResponse(DocumentComment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .documentId(comment.getDocument().getId())
                .content(comment.getContent())
                .authorName(comment.getUser().getName())
                .authorEmail(comment.getUser().getEmail())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
