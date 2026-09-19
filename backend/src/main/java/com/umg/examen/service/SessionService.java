package com.umg.examen.service;

import com.umg.examen.dto.response.AuthResponse;
import com.umg.examen.entity.User;
import com.umg.examen.mapper.UserMapper;
import com.umg.examen.repository.UserRepository;
import com.umg.examen.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Service
public class SessionService {
    private final JdbcTemplate jdbc;
    private final UserRepository users;
    private final UserMapper mapper;
    private final JwtTokenProvider jwt;
    private final SecureRandom random = new SecureRandom();
    @Value("${app.jwt.refresh-expiration-ms:1800000}") private long refreshDuration;

    public SessionService(JdbcTemplate jdbc, UserRepository users, UserMapper mapper, JwtTokenProvider jwt) {
        this.jdbc = jdbc; this.users = users; this.mapper = mapper; this.jwt = jwt;
    }

    private String secret() {
        byte[] bytes = new byte[32]; random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
    private String hash(String value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch (java.security.NoSuchAlgorithmException ex) { throw new IllegalStateException(ex); }
    }
    private AuthResponse response(User user, String id, String refresh) {
        var roles = user.getRoles().stream().map(role -> role.getName()).toList();
        AuthResponse result = mapper.toAuthResponse(user, jwt.generateSessionToken(user.getUsername(), roles, id));
        result.setRefreshToken(refresh);
        result.setExpiresIn(jwt.getExpirationMs() / 1000);
        return result;
    }
    @Transactional
    public AuthResponse create(User user) {
        String id = UUID.randomUUID().toString();
        String refresh = secret();
        jdbc.update("INSERT INTO auth_sessions (id, username, refresh_hash, expires_at) VALUES (?, ?, ?, ?)",
            id, user.getUsername(), hash(refresh), Timestamp.from(Instant.now().plusMillis(refreshDuration)));
        return response(user, id, refresh);
    }
    @Transactional
    public AuthResponse refresh(String refresh) {
        if (refresh == null || refresh.length() > 200) throw new BadCredentialsException("Refresh inválido");
        var rows = jdbc.queryForList("SELECT id, username FROM auth_sessions WHERE refresh_hash = ? AND revoked_at IS NULL AND expires_at > CURRENT_TIMESTAMP FOR UPDATE", hash(refresh));
        if (rows.isEmpty()) throw new BadCredentialsException("Refresh expirado o revocado");
        var row = rows.getFirst();
        User user = users.findByUsername((String) row.get("username")).orElseThrow(() -> new BadCredentialsException("Usuario inválido"));
        if (!Boolean.TRUE.equals(user.getEnabled())) throw new BadCredentialsException("Usuario deshabilitado");
        String next = secret();
        jdbc.update("UPDATE auth_sessions SET refresh_hash = ? WHERE id = ?", hash(next), row.get("id"));
        return response(user, (String) row.get("id"), next);
    }
}
