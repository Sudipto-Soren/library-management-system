package com.librarymanagement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for book issue requests.
 * Contains the ID of the book to be issued.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueRequest {

    @NotNull(message = "Book ID is required")
    private Long bookId;
}
