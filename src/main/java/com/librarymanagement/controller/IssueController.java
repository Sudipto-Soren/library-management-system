package com.librarymanagement.controller;

import com.librarymanagement.dto.ApiResponse;
import com.librarymanagement.dto.IssueRequest;
import com.librarymanagement.dto.IssueResponse;
import com.librarymanagement.service.IssueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing book issue and return operations.
 * Authenticated users can issue/return books and view their own records.
 * Admins can view all issue records across the system.
 */
@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
@Tag(name = "Book Issues", description = "Endpoints for issuing and returning books")
public class IssueController {

    private final IssueService issueService;

    /**
     * Issues a book to the currently authenticated user.
     */
    @PostMapping("/issue")
    @Operation(summary = "Issue a book", description = "Issues a book to the currently authenticated user with a 14-day due date")
    public ResponseEntity<ApiResponse<IssueResponse>> issueBook(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody IssueRequest request) {

        IssueResponse issue = issueService.issueBook(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Book issued successfully", issue));
    }

    /**
     * Returns a previously issued book.
     */
    @PostMapping("/return/{id}")
    @Operation(summary = "Return a book", description = "Processes the return of a previously issued book")
    public ResponseEntity<ApiResponse<IssueResponse>> returnBook(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        IssueResponse issue = issueService.returnBook(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Book returned successfully", issue));
    }

    /**
     * Retrieves the issue history of the currently authenticated user.
     */
    @GetMapping("/my-issues")
    @Operation(summary = "Get my issues", description = "Retrieves the paginated issue history of the currently authenticated user")
    public ResponseEntity<ApiResponse<Page<IssueResponse>>> getMyIssues(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "issueDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        PageRequest pageRequest = PageRequest.of(page, size, sort);
        Page<IssueResponse> issues = issueService.getMyIssues(userDetails.getUsername(), pageRequest);

        return ResponseEntity.ok(ApiResponse.success("Issue records retrieved successfully", issues));
    }

    /**
     * Retrieves all issue records across all users (ADMIN only).
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all issues (Admin)", description = "Retrieves a paginated list of all issue records. Requires ADMIN role.")
    public ResponseEntity<ApiResponse<Page<IssueResponse>>> getAllIssues(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "issueDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        PageRequest pageRequest = PageRequest.of(page, size, sort);
        Page<IssueResponse> issues = issueService.getAllIssues(pageRequest);

        return ResponseEntity.ok(ApiResponse.success("All issue records retrieved successfully", issues));
    }
}
