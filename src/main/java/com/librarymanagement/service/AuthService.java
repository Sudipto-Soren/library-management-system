package com.librarymanagement.service;

import com.librarymanagement.dto.AuthResponse;
import com.librarymanagement.dto.LoginRequest;
import com.librarymanagement.dto.RegisterRequest;
import com.librarymanagement.entity.User;
import com.librarymanagement.enums.Role;
import com.librarymanagement.exception.BadRequestException;
import com.librarymanagement.exception.DuplicateResourceException;
import com.librarymanagement.repository.UserRepository;
import com.librarymanagement.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Service handling user registration and login operations.
 * <p>
 * Manages credential validation, password encoding, JWT token generation,
 * and duplicate email detection during registration.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    /**
     * Registers a new user with the USER role.
     * <p>
     * Checks for duplicate email, encodes the password, persists the user,
     * and returns a JWT token along with basic user info.
     *
     * @param request the registration request containing name, email, and password
     * @return an AuthResponse with the JWT token and user details
     * @throws DuplicateResourceException if the email is already registered
     */
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        // Check for duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User with email '" + request.getEmail() + "' already exists");
        }

        // Build and save the new user entity
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);
        log.info("User registered successfully with email: {}", user.getEmail());

        // Generate JWT token for immediate login after registration
        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    /**
     * Authenticates a user with their email and password.
     * <p>
     * Delegates credential validation to Spring Security's AuthenticationManager,
     * then generates and returns a JWT token.
     *
     * @param request the login request containing email and password
     * @return an AuthResponse with the JWT token and user details
     * @throws BadRequestException if the credentials are invalid
     */
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        try {
            // Authenticate via Spring Security's AuthenticationManager
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (AuthenticationException e) {
            log.warn("Authentication failed for email: {}", request.getEmail());
            throw new BadRequestException("Invalid email or password");
        }

        // Fetch the authenticated user and generate a JWT token
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        String token = jwtUtil.generateToken(user);
        log.info("User logged in successfully: {}", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
