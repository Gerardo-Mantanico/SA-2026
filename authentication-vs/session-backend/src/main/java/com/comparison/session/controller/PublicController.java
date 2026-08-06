package com.comparison.session.controller;

import com.comparison.session.dto.RegisterRequest;
import com.comparison.session.model.User;
import com.comparison.session.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PublicController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Username is already taken."));
        }

        String assignedRole = registerRequest.getRole() != null ? registerRequest.getRole() : "ROLE_USER";
        if (!assignedRole.startsWith("ROLE_")) {
            assignedRole = "ROLE_" + assignedRole.toUpperCase();
        }

        User user = User.builder()
                .username(registerRequest.getUsername())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(assignedRole)
                .blocked(false)
                .passwordVersion(1)
                .build();

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "User registered successfully",
                "username", user.getUsername(),
                "role", user.getRole()
        ));
    }

    @GetMapping("/info")
    public ResponseEntity<?> getPublicInfo() {
        return ResponseEntity.ok(Map.of(
                "app", "Session-Based Authentication Demo",
                "description", "This backend uses HttpSession and cookie JSESSIONID to maintain state."
        ));
    }
}
