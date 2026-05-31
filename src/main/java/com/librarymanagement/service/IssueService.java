package com.librarymanagement.service;

import com.librarymanagement.dto.IssueRequest;
import com.librarymanagement.dto.IssueResponse;
import com.librarymanagement.entity.Book;
import com.librarymanagement.entity.IssueRecord;
import com.librarymanagement.entity.User;
import com.librarymanagement.enums.IssueStatus;
import com.librarymanagement.exception.BadRequestException;
import com.librarymanagement.exception.BookUnavailableException;
import com.librarymanagement.exception.DuplicateResourceException;
import com.librarymanagement.exception.ResourceNotFoundException;
import com.librarymanagement.repository.BookRepository;
import com.librarymanagement.repository.IssueRecordRepository;
import com.librarymanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service layer for managing book issue and return operations.
 * All mutating operations are transactional to ensure data consistency
 * between the issue record and book availability counters.
 */
@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRecordRepository issueRecordRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    /**
     * Issues a book to the authenticated user.
     * <p>
     * Validates that:
     * <ul>
     *   <li>The user and book exist</li>
     *   <li>The book has available copies</li>
     *   <li>The user has not already issued the same book</li>
     * </ul>
     * Creates an issue record with a 14-day due date and decrements available quantity.
     *
     * @param userEmail the email of the requesting user
     * @param request   contains the book ID to issue
     * @return the created issue as a response DTO
     */
    @Transactional
    public IssueResponse issueBook(String userEmail, IssueRequest request) {
        // 1. Find the user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        // 2. Find the book
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + request.getBookId()));

        // 3. Check book availability
        if (book.getAvailableQuantity() <= 0) {
            throw new BookUnavailableException("Book '" + book.getTitle() + "' is currently unavailable");
        }

        // 4. Prevent duplicate active issue for the same user + book combination
        issueRecordRepository.findByUserAndBookAndStatus(user, book, IssueStatus.ISSUED)
                .ifPresent(existing -> {
                    throw new DuplicateResourceException("You have already issued this book");
                });

        // 5. Create the issue record with a 14-day borrowing window
        IssueRecord issueRecord = IssueRecord.builder()
                .user(user)
                .book(book)
                .issueDate(LocalDateTime.now())
                .dueDate(LocalDateTime.now().plusDays(14))
                .status(IssueStatus.ISSUED)
                .build();

        // 6. Decrement available quantity
        book.setAvailableQuantity(book.getAvailableQuantity() - 1);
        bookRepository.save(book);

        // 7. Persist and return
        IssueRecord savedRecord = issueRecordRepository.save(issueRecord);
        return mapToResponse(savedRecord);
    }

    /**
     * Processes the return of an issued book.
     * <p>
     * Validates ownership and that the book has not already been returned.
     * Marks the record as RETURNED and increments available quantity.
     *
     * @param userEmail the email of the user returning the book
     * @param issueId   the ID of the issue record to close
     * @return the updated issue as a response DTO
     */
    @Transactional
    public IssueResponse returnBook(String userEmail, Long issueId) {
        // 1. Find the issue record
        IssueRecord issueRecord = issueRecordRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue record not found with id: " + issueId));

        // 2. Verify the issue belongs to the requesting user
        if (!issueRecord.getUser().getEmail().equals(userEmail)) {
            throw new BadRequestException("This issue record does not belong to you");
        }

        // 3. Ensure the book hasn't already been returned
        if (issueRecord.getStatus() == IssueStatus.RETURNED) {
            throw new BadRequestException("Book already returned");
        }

        // 4. Mark as returned
        issueRecord.setReturnDate(LocalDateTime.now());
        issueRecord.setStatus(IssueStatus.RETURNED);

        // 5. Increment available quantity
        Book book = issueRecord.getBook();
        book.setAvailableQuantity(book.getAvailableQuantity() + 1);
        bookRepository.save(book);

        // 6. Persist and return
        IssueRecord updatedRecord = issueRecordRepository.save(issueRecord);
        return mapToResponse(updatedRecord);
    }

    /**
     * Retrieves all issue records for the authenticated user (paginated).
     *
     * @param userEmail the email of the requesting user
     * @param pageable  pagination information
     * @return a page of issue response DTOs
     */
    public Page<IssueResponse> getMyIssues(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        return issueRecordRepository.findByUser(user, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Retrieves all issue records across all users (paginated).
     * Intended for ADMIN use only.
     *
     * @param pageable pagination information
     * @return a page of issue response DTOs
     */
    public Page<IssueResponse> getAllIssues(Pageable pageable) {
        return issueRecordRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    /**
     * Maps an IssueRecord entity to its corresponding response DTO.
     */
    private IssueResponse mapToResponse(IssueRecord record) {
        return IssueResponse.builder()
                .id(record.getId())
                .userName(record.getUser().getName())
                .bookTitle(record.getBook().getTitle())
                .issueDate(record.getIssueDate())
                .dueDate(record.getDueDate())
                .returnDate(record.getReturnDate())
                .status(record.getStatus().name())
                .build();
    }
}
