package com.librarymanagement.controller;

import com.librarymanagement.dto.ApiResponse;
import com.librarymanagement.dto.AuthResponse;
import com.librarymanagement.dto.LoginRequest;
import com.librarymanagement.dto.RegisterRequest;
import com.librarymanagement.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for authentication operations.
 * <p>
 * Provides endpoints for user registration and login, returning JWT tokens
 * upon successful authentication.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication endpoints")
public class AuthController {

    private final AuthService authService;

    /**
     * Registers a new user account.
     * <p>
     * Accepts user details, creates the account with USER role,
     * and returns a JWT token for immediate access.
     *
     * @param request the registration details (name, email, password)
     * @return 201 Created with JWT token and user info
     */
    @Operation(
            summary = "Register a new user",
            description = "Creates a new user account with USER role and returns a JWT authentication token"
    )
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        AuthResponse authResponse = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", authResponse));
    }

    /**
     * Authenticates an existing user.
     * <p>
     * Validates credentials and returns a JWT token on success.
     *
     * @param request the login credentials (email, password)
     * @return 200 OK with JWT token and user info
     */
    @Operation(
            summary = "Login with existing credentials",
            description = "Authenticates the user and returns a JWT authentication token"
    )
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request
    ) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity
                .ok(ApiResponse.success("Login successful", authResponse));
    }
}
