package com.auth.demo.controller;

import com.auth.demo.dto.RegisterRequest;
import com.auth.demo.model.User;
import com.auth.demo.repository.UserRepository;
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

    @GetMapping("/info")
    public ResponseEntity<?> getPublicInfo() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "message", "This is public data accessible to anyone.",
                "timestamp", System.currentTimeMillis()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists.");
        }

        String role = registerRequest.getRole();
        if (role == null || (!role.equals("ROLE_USER") && !role.equals("ROLE_ADMIN"))) {
            role = "ROLE_USER";
        }

        User user = User.builder()
                .username(registerRequest.getUsername())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(role)
                .blocked(false)
                .passwordVersion(1)
                .build();

        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "User registered successfully.",
                "username", user.getUsername(),
                "role", user.getRole()
        ));
    }
}
