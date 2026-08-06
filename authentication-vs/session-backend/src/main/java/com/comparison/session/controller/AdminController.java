package com.comparison.session.controller;

import com.comparison.session.model.User;
import com.comparison.session.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
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
            return ResponseEntity.badRequest().body(Map.of("error", "Username and block state are required."));
        }

        if ("admin".equals(username) && block) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot block the admin user."));
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setBlocked(block);
        userRepository.save(user);

        String action = block ? "blocked" : "unblocked";
        return ResponseEntity.ok(Map.of(
                "message", "User " + username + " has been " + action,
                "username", username,
                "blocked", block
        ));
    }
}
