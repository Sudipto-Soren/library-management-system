package com.librarymanagement.repository;

import com.librarymanagement.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Book entity operations.
 * Provides CRUD operations and custom query methods for book catalog management.
 */
@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    /**
     * Finds a book by its ISBN.
     *
     * @param isbn the ISBN to search for
     * @return an Optional containing the book if found
     */
    Optional<Book> findByIsbn(String isbn);

    /**
     * Checks if a book with the given ISBN already exists.
     *
     * @param isbn the ISBN to check
     * @return true if a book with the ISBN exists, false otherwise
     */
    boolean existsByIsbn(String isbn);

    /**
     * Searches for books by title or author using case-insensitive partial matching.
     *
     * @param keyword  the search keyword to match against title or author
     * @param pageable pagination information
     * @return a page of books matching the search criteria
     */
    @Query("SELECT b FROM Book b WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Book> searchBooks(@Param("keyword") String keyword, Pageable pageable);
}
