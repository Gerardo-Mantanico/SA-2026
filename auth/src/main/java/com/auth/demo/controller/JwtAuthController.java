package com.auth.demo.controller;

import com.auth.demo.dto.ChangePasswordRequest;
import com.auth.demo.dto.LoginRequest;
import com.auth.demo.dto.LoginResponse;
import com.auth.demo.model.JwtBlocklist;
import com.auth.demo.model.RefreshToken;
import com.auth.demo.model.User;
import com.auth.demo.repository.JwtBlocklistRepository;
import com.auth.demo.repository.UserRepository;
import com.auth.demo.security.JwtUtils;
import com.auth.demo.security.RefreshTokenService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@RestController
@RequestMapping("/api/jwt")
public class JwtAuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;
    private final JwtBlocklistRepository jwtBlocklistRepository;

    public JwtAuthController(AuthenticationManager authenticationManager, UserRepository userRepository,
                             PasswordEncoder passwordEncoder, JwtUtils jwtUtils,
                             RefreshTokenService refreshTokenService, JwtBlocklistRepository jwtBlocklistRepository) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.refreshTokenService = refreshTokenService;
        this.jwtBlocklistRepository = jwtBlocklistRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );

            User user = userRepository.findByUsername(loginRequest.getUsername()).get();

            // Generate Access Token (1 minute expiration) containing passwordVersion
            String accessToken = jwtUtils.generateAccessToken(user.getUsername(), user.getRole(), user.getPasswordVersion());

            // Generate Refresh Token (24 hours expiration)
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

            // Store Refresh Token in HttpOnly cookie
            ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken.getToken())
                    .httpOnly(true)
                    .secure(false) // true in production (HTTPS)
                    .path("/")
                    .maxAge(24 * 60 * 60)
                    .sameSite("Strict")
                    .build();

            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            return ResponseEntity.ok(new LoginResponse(accessToken, user.getUsername(), user.getRole()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials or user is blocked.");
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request, HttpServletResponse response) {
        String token = getRefreshTokenFromCookie(request);

        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Refresh Token is missing");
        }

        return refreshTokenService.findByToken(token)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    if (user.isBlocked()) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User is blocked.");
                    }
                    
                    // Generate new Access Token
                    String accessToken = jwtUtils.generateAccessToken(user.getUsername(), user.getRole(), user.getPasswordVersion());

                    // Refresh token rotation (security best practice)
                    RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user.getId());
                    
                    ResponseCookie cookie = ResponseCookie.from("refreshToken", newRefreshToken.getToken())
                            .httpOnly(true)
                            .secure(false)
                            .path("/")
                            .maxAge(24 * 60 * 60)
                            .sameSite("Strict")
                            .build();
                    response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

                    return ResponseEntity.ok(Map.of("accessToken", accessToken));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token not found in database. Please log in again."));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        // 1. Blacklist the active access token
        String headerAuth = request.getHeader("Authorization");
        if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
            String jwt = headerAuth.substring(7);
            if (jwtUtils.validateJwtToken(jwt)) {
                Claims claims = jwtUtils.getClaimsFromToken(jwt);
                Date expiration = claims.getExpiration();
                
                JwtBlocklist blocklistEntry = JwtBlocklist.builder()
                        .token(jwt)
                        .expiryDate(expiration.toInstant())
                        .build();
                try {
                    jwtBlocklistRepository.save(blocklistEntry);
                } catch (Exception e) {
                    // Already blacklisted
                }
            }
        }

        // 2. Delete the Refresh Token from the DB
        String refreshToken = getRefreshTokenFromCookie(request);
        if (refreshToken != null) {
            refreshTokenService.findByToken(refreshToken).ifPresent(token -> {
                refreshTokenService.deleteByUser(token.getUser());
            });
        }

        // 3. Clear the refresh token cookie
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(Map.of("message", "Logged out successfully (JWT blacklisted, refresh token removed)"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest changeRequest, Principal principal, HttpServletRequest request, HttpServletResponse response) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String username = principal.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(changeRequest.getOldPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Incorrect old password");
        }

        // Update password and increment version
        user.setPassword(passwordEncoder.encode(changeRequest.getNewPassword()));
        user.setPasswordVersion(user.getPasswordVersion() + 1);
        userRepository.save(user);

        // Delete all refresh tokens for this user
        refreshTokenService.deleteByUser(user);

        // Blacklist current access token
        String headerAuth = request.getHeader("Authorization");
        if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
            String jwt = headerAuth.substring(7);
            if (jwtUtils.validateJwtToken(jwt)) {
                Claims claims = jwtUtils.getClaimsFromToken(jwt);
                jwtBlocklistRepository.save(JwtBlocklist.builder()
                        .token(jwt)
                        .expiryDate(claims.getExpiration().toInstant())
                        .build());
            }
        }

        // Clear refresh token cookie
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(Map.of("message", "Password changed successfully. Tokens invalidated."));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "role", user.getRole(),
                "blocked", user.isBlocked(),
                "passwordVersion", user.getPasswordVersion(),
                "authMethod", "JWT (Stateless)"
        ));
    }

    private String getRefreshTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
