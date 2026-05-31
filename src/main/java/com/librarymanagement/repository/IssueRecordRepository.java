package com.librarymanagement.repository;

import com.librarymanagement.entity.Book;
import com.librarymanagement.entity.IssueRecord;
import com.librarymanagement.entity.User;
import com.librarymanagement.enums.IssueStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for IssueRecord entity operations.
 * Provides CRUD operations and custom query methods for book issue/return tracking.
 */
@Repository
public interface IssueRecordRepository extends JpaRepository<IssueRecord, Long> {

    /**
     * Finds all issue records for a specific user with pagination.
     *
     * @param user     the user whose records to find
     * @param pageable pagination information
     * @return a page of issue records for the user
     */
    Page<IssueRecord> findByUser(User user, Pageable pageable);

    /**
     * Finds an issue record for a specific user, book, and status combination.
     * Useful for checking if a user currently has a specific book issued.
     *
     * @param user   the user
     * @param book   the book
     * @param status the issue status
     * @return an Optional containing the matching issue record if found
     */
    Optional<IssueRecord> findByUserAndBookAndStatus(User user, Book book, IssueStatus status);
}
