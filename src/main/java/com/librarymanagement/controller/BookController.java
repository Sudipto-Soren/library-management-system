package com.librarymanagement.controller;

import com.librarymanagement.dto.ApiResponse;
import com.librarymanagement.dto.BookRequest;
import com.librarymanagement.dto.BookResponse;
import com.librarymanagement.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing library books.
 * Provides endpoints for CRUD operations and keyword-based search.
 */
@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@Tag(name = "Books", description = "Endpoints for managing library books")
public class BookController {

    private final BookService bookService;

    /**
     * Adds a new book to the library catalogue.
     */
    @PostMapping
    @Operation(summary = "Add a new book", description = "Creates a new book entry in the library catalogue")
    public ResponseEntity<ApiResponse<BookResponse>> addBook(@Valid @RequestBody BookRequest request) {
        BookResponse book = bookService.addBook(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Book added successfully", book));
    }

    /**
     * Retrieves a paginated, sorted list of all books.
     */
    @GetMapping
    @Operation(summary = "Get all books", description = "Retrieves a paginated and sorted list of all books")
    public ResponseEntity<ApiResponse<Page<BookResponse>>> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        PageRequest pageRequest = PageRequest.of(page, size, sort);
        Page<BookResponse> books = bookService.getAllBooks(pageRequest);

        return ResponseEntity.ok(ApiResponse.success("Books retrieved successfully", books));
    }

    /**
     * Retrieves a single book by its ID.
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get book by ID", description = "Retrieves a specific book by its unique identifier")
    public ResponseEntity<ApiResponse<BookResponse>> getBookById(@PathVariable Long id) {
        BookResponse book = bookService.getBookById(id);
        return ResponseEntity.ok(ApiResponse.success("Book retrieved successfully", book));
    }

    /**
     * Searches books by keyword across title, author, category, and ISBN.
     */
    @GetMapping("/search")
    @Operation(summary = "Search books", description = "Searches books by keyword matching title, author, category, or ISBN")
    public ResponseEntity<ApiResponse<Page<BookResponse>>> searchBooks(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageRequest pageRequest = PageRequest.of(page, size);
        Page<BookResponse> books = bookService.searchBooks(keyword, pageRequest);

        return ResponseEntity.ok(ApiResponse.success("Search results retrieved successfully", books));
    }

    /**
     * Updates an existing book's details.
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update a book", description = "Updates the details of an existing book")
    public ResponseEntity<ApiResponse<BookResponse>> updateBook(
            @PathVariable Long id,
            @Valid @RequestBody BookRequest request) {

        BookResponse book = bookService.updateBook(id, request);
        return ResponseEntity.ok(ApiResponse.success("Book updated successfully", book));
    }

    /**
     * Deletes a book from the catalogue.
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a book", description = "Removes a book from the library catalogue")
    public ResponseEntity<ApiResponse<Void>> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok(ApiResponse.success("Book deleted successfully", null));
    }
}
