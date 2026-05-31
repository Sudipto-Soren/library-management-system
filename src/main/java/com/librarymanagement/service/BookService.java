package com.librarymanagement.service;

import com.librarymanagement.dto.BookRequest;
import com.librarymanagement.dto.BookResponse;
import com.librarymanagement.entity.Book;
import com.librarymanagement.exception.DuplicateResourceException;
import com.librarymanagement.exception.ResourceNotFoundException;
import com.librarymanagement.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Service layer for managing Book entities.
 * Handles business logic for CRUD operations, search, and ISBN uniqueness validation.
 */
@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

    /**
     * Adds a new book to the library catalogue.
     * Validates that the ISBN is unique before persisting.
     *
     * @param request the book details to create
     * @return the created book as a response DTO
     * @throws DuplicateResourceException if a book with the same ISBN already exists
     */
    public BookResponse addBook(BookRequest request) {
        // Ensure ISBN uniqueness
        if (bookRepository.existsByIsbn(request.getIsbn())) {
            throw new DuplicateResourceException("Book with ISBN '" + request.getIsbn() + "' already exists");
        }

        Book book = Book.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .isbn(request.getIsbn())
                .category(request.getCategory())
                .quantity(request.getQuantity())
                .availableQuantity(request.getQuantity()) // All copies are available initially
                .createdAt(LocalDateTime.now())
                .build();

        Book savedBook = bookRepository.save(book);
        return mapToResponse(savedBook);
    }

    /**
     * Retrieves a single book by its ID.
     *
     * @param id the book's primary key
     * @return the matching book as a response DTO
     * @throws ResourceNotFoundException if no book is found with the given ID
     */
    public BookResponse getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        return mapToResponse(book);
    }

    /**
     * Retrieves a paginated list of all books.
     *
     * @param pageable pagination and sorting information
     * @return a page of book response DTOs
     */
    public Page<BookResponse> getAllBooks(Pageable pageable) {
        return bookRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    /**
     * Searches books by a keyword (matches title, author, category, or ISBN).
     *
     * @param keyword  the search term
     * @param pageable pagination information
     * @return a page of matching book response DTOs
     */
    public Page<BookResponse> searchBooks(String keyword, Pageable pageable) {
        return bookRepository.searchBooks(keyword, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Updates an existing book's details.
     * Recalculates availableQuantity when the total quantity changes.
     *
     * @param id      the ID of the book to update
     * @param request the new book details
     * @return the updated book as a response DTO
     * @throws ResourceNotFoundException  if no book is found with the given ID
     * @throws DuplicateResourceException if the new ISBN collides with another book
     */
    public BookResponse updateBook(Long id, BookRequest request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        // Check ISBN uniqueness only if it has changed
        if (!book.getIsbn().equals(request.getIsbn()) && bookRepository.existsByIsbn(request.getIsbn())) {
            throw new DuplicateResourceException("Book with ISBN '" + request.getIsbn() + "' already exists");
        }

        // Adjust availableQuantity proportionally to the quantity change
        int quantityDifference = request.getQuantity() - book.getQuantity();
        int newAvailableQuantity = book.getAvailableQuantity() + quantityDifference;

        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setIsbn(request.getIsbn());
        book.setCategory(request.getCategory());
        book.setQuantity(request.getQuantity());
        book.setAvailableQuantity(newAvailableQuantity);

        Book updatedBook = bookRepository.save(book);
        return mapToResponse(updatedBook);
    }

    /**
     * Deletes a book from the catalogue by ID.
     *
     * @param id the ID of the book to delete
     * @throws ResourceNotFoundException if no book is found with the given ID
     */
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        bookRepository.delete(book);
    }

    /**
     * Maps a Book entity to its corresponding response DTO.
     */
    private BookResponse mapToResponse(Book book) {
        return BookResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .isbn(book.getIsbn())
                .category(book.getCategory())
                .quantity(book.getQuantity())
                .availableQuantity(book.getAvailableQuantity())
                .createdAt(book.getCreatedAt())
                .build();
    }
}
