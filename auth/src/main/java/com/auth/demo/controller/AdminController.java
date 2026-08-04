package com.auth.demo.controller;

import com.auth.demo.model.User;
import com.auth.demo.repository.UserRepository;
import com.auth.demo.security.RefreshTokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;

    public AdminController(UserRepository userRepository, RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.refreshTokenService = refreshTokenService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/block")
    public ResponseEntity<?> toggleBlockUser(@RequestBody Map<String, Object> payload) {
        String username = (String) payload.get("username");
        Boolean block = (Boolean) payload.get("block");

        if (username == null || block == null) {
            return ResponseEntity.badRequest().body("Username and block state are required.");
        }

        if ("admin".equals(username) && block) {
            return ResponseEntity.badRequest().body("Cannot block the admin user.");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setBlocked(block);
        userRepository.save(user);

        if (block) {
            // Delete all active refresh tokens for the blocked user
            refreshTokenService.deleteByUser(user);
        }

        String action = block ? "blocked" : "unblocked";
        return ResponseEntity.ok(Map.of(
                "message", "User " + username + " has been " + action,
                "username", username,
                "blocked", block
        ));
    }
}
