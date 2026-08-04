package com.auth.demo.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String role; // "ROLE_USER" or "ROLE_ADMIN"
}
