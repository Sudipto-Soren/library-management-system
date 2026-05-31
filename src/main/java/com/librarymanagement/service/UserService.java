package com.librarymanagement.service;

import com.librarymanagement.dto.UserResponse;
import com.librarymanagement.dto.UserUpdateRequest;
import com.librarymanagement.entity.User;
import com.librarymanagement.exception.DuplicateResourceException;
import com.librarymanagement.exception.ResourceNotFoundException;
import com.librarymanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

/**
 * Service layer for managing User entities.
 * Provides profile retrieval, listing, and profile update capabilities.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * Retrieves a single user by their ID.
     *
     * @param id the user's primary key
     * @return the matching user as a response DTO
     * @throws ResourceNotFoundException if no user is found with the given ID
     */
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToResponse(user);
    }

    /**
     * Retrieves a paginated list of all registered users.
     *
     * @param pageable pagination and sorting information
     * @return a page of user response DTOs
     */
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    /**
     * Updates the profile of an existing user.
     * Validates email uniqueness if the email has changed.
     *
     * @param userId  the ID of the user whose profile is being updated
     * @param request the new profile details
     * @return the updated user as a response DTO
     * @throws ResourceNotFoundException  if no user is found with the given ID
     * @throws DuplicateResourceException if the new email is already taken by another user
     */
    public UserResponse updateProfile(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Check email uniqueness only if it has changed
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email '" + request.getEmail() + "' is already in use");
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    /**
     * Retrieves the currently authenticated user by their email.
     *
     * @param email the email of the current user (from the security context)
     * @return the matching user as a response DTO
     * @throws ResourceNotFoundException if no user is found with the given email
     */
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return mapToResponse(user);
    }

    /**
     * Maps a User entity to its corresponding response DTO.
     */
    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
