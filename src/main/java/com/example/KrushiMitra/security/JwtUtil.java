package com.example.KrushiMitra.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Slf4j
@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration}")
    private long expiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String email) {
        log.debug("Generating JWT token for: {}", email);
        String token = Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
        log.debug("JWT token generated for: {} (expires in {}ms)", email, expiration);
        return token;
    }

    public String extractEmail(String token) {
        String email = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
        log.debug("Extracted email from JWT: {}", email);
        return email;
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String email = extractEmail(token);
        boolean valid = email.equals(userDetails.getUsername()) && !isTokenExpired(token);
        if (!valid) {
            log.warn("JWT validation failed — token email: {}, userDetails: {}, expired: {}",
                    email, userDetails.getUsername(), isTokenExpired(token));
        }
        return valid;
    }

    private boolean isTokenExpired(String token) {
        Date expiry = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration();
        boolean expired = expiry.before(new Date());
        if (expired) {
            log.debug("JWT token expired at: {}", expiry);
        }
        return expired;
    }
}