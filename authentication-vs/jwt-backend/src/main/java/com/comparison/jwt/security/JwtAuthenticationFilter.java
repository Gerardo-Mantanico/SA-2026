package com.comparison.jwt.security;

import com.comparison.jwt.model.User;
import com.comparison.jwt.repository.JwtBlocklistRepository;
import com.comparison.jwt.repository.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final JwtBlocklistRepository jwtBlocklistRepository;

    public JwtAuthenticationFilter(JwtUtils jwtUtils, UserRepository userRepository, JwtBlocklistRepository jwtBlocklistRepository) {
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
        this.jwtBlocklistRepository = jwtBlocklistRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = parseJwt(request);
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                
                // 1. Check if token is blacklisted (logged out)
                if (jwtBlocklistRepository.existsByToken(jwt)) {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token has been blacklisted.");
                    return;
                }

                Claims claims = jwtUtils.getClaimsFromToken(jwt);
                String username = claims.getSubject();
                Integer tokenPasswordVersion = claims.get("passwordVersion", Integer.class);

                // 2. Fetch user to verify active status and password version
                Optional<User> userOpt = userRepository.findByUsername(username);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();

                    if (user.isBlocked()) {
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User is blocked.");
                        return;
                    }

                    if (tokenPasswordVersion != null && tokenPasswordVersion != user.getPasswordVersion()) {
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token version mismatch (password changed).");
                        return;
                    }

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            user.getUsername(), null, Collections.singletonList(new SimpleGrantedAuthority(user.getRole())));
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e);
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }
}
