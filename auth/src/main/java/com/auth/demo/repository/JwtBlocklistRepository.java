package com.auth.demo.repository;

import com.auth.demo.model.JwtBlocklist;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JwtBlocklistRepository extends JpaRepository<JwtBlocklist, Long> {
    boolean existsByToken(String token);
}
