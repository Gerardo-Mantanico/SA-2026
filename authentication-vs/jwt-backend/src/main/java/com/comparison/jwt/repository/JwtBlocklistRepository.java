package com.comparison.jwt.repository;

import com.comparison.jwt.model.JwtBlocklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JwtBlocklistRepository extends JpaRepository<JwtBlocklist, Long> {
    boolean existsByToken(String token);
}
