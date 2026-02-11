package com.alphadocuments.documentorganiserbackend.controller;

import com.alphadocuments.documentorganiserbackend.dto.response.ApiResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.PagedResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.TrashItemResponse;
import com.alphadocuments.documentorganiserbackend.security.CurrentUser;
import com.alphadocuments.documentorganiserbackend.security.UserPrincipal;
import com.alphadocuments.documentorganiserbackend.service.TrashService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller for trash/recycle bin operations.
 */
@RestController
@RequestMapping("/trash")
@RequiredArgsConstructor
@Tag(name = "Trash", description = "Trash/Recycle bin management APIs")
public class TrashController {

    private final TrashService trashService;

    @GetMapping
    @Operation(summary = "Get trash items", description = "Get all items in the trash")
    public ResponseEntity<ApiResponse<PagedResponse<TrashItemResponse>>> getTrashItems(
            @CurrentUser UserPrincipal userPrincipal,
            @PageableDefault(size = 20, sort = "deletedAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<TrashItemResponse> page = trashService.getTrashItems(userPrincipal.getId(), pageable);

        PagedResponse<TrashItemResponse> response = PagedResponse.<TrashItemResponse>builder()
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

    @PostMapping("/{trashItemId}/restore")
    @Operation(summary = "Restore item", description = "Restore an item from trash")
    public ResponseEntity<ApiResponse<Void>> restoreItem(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID trashItemId) {

        trashService.restoreItem(userPrincipal.getId(), trashItemId);
        return ResponseEntity.ok(ApiResponse.success("Item restored successfully"));
    }

    @DeleteMapping("/{trashItemId}")
    @Operation(summary = "Permanently delete", description = "Permanently delete an item from trash")
    public ResponseEntity<ApiResponse<Void>> permanentlyDelete(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID trashItemId) {

        trashService.permanentlyDelete(userPrincipal.getId(), trashItemId);
        return ResponseEntity.ok(ApiResponse.success("Item permanently deleted"));
    }

    @DeleteMapping("/empty")
    @Operation(summary = "Empty trash", description = "Permanently delete all items in trash")
    public ResponseEntity<ApiResponse<Void>> emptyTrash(@CurrentUser UserPrincipal userPrincipal) {
        trashService.emptyTrash(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Trash emptied successfully"));
    }
}
