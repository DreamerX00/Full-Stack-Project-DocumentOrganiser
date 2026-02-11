package com.alphadocuments.documentorganiserbackend.controller;

import com.alphadocuments.documentorganiserbackend.dto.response.ActivityResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.ApiResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.PagedResponse;
import com.alphadocuments.documentorganiserbackend.entity.enums.ActivityType;
import com.alphadocuments.documentorganiserbackend.security.CurrentUser;
import com.alphadocuments.documentorganiserbackend.security.UserPrincipal;
import com.alphadocuments.documentorganiserbackend.service.ActivityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for activity log endpoints.
 */
@RestController
@RequestMapping("/activity")
@RequiredArgsConstructor
@Tag(name = "Activity", description = "Activity log APIs")
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping
    @Operation(summary = "Get activity log", description = "Get activity log for the current user")
    public ResponseEntity<ApiResponse<PagedResponse<ActivityResponse>>> getActivities(
            @CurrentUser UserPrincipal userPrincipal,
            @RequestParam(required = false) ActivityType type,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<ActivityResponse> page;

        if (type != null) {
            page = activityService.getActivitiesByType(userPrincipal.getId(), type, pageable);
        } else {
            page = activityService.getActivities(userPrincipal.getId(), pageable);
        }

        PagedResponse<ActivityResponse> response = PagedResponse.<ActivityResponse>builder()
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
}
