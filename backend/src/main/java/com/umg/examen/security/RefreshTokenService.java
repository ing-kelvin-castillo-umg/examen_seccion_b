package com.umg.examen.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Política de ciclo de vida para refresh tokens.
 * Los tokens son opacos, rotan en cada renovación y se revocan al cerrar sesión.
 */
@Service
public class RefreshTokenService {

    private final Map<String, RefreshSession> sessions = new ConcurrentHashMap<>();
    private final long expirationMs;

    public RefreshTokenService(@Value("${app.jwt.refresh-expiration-ms:604800000}") long expirationMs) {
        this.expirationMs = expirationMs;
    }

    public String issue(String username) {
        purgeExpired();
        String token = UUID.randomUUID().toString();
        sessions.put(token, new RefreshSession(username, Instant.now().plusMillis(expirationMs)));
        return token;
    }

    public String getUsername(String refreshToken) {
        if (!StringUtils.hasText(refreshToken)) {
            return null;
        }

        RefreshSession session = sessions.get(refreshToken);
        if (session == null || session.expiresAt().isBefore(Instant.now())) {
            sessions.remove(refreshToken);
            return null;
        }

        return session.username();
    }

    public String rotate(String refreshToken) {
        String username = getUsername(refreshToken);
        if (username == null) {
            return null;
        }

        sessions.remove(refreshToken);
        return issue(username);
    }

    public void revoke(String refreshToken) {
        if (StringUtils.hasText(refreshToken)) {
            sessions.remove(refreshToken);
        }
    }

    public void revokeAll(String username) {
        if (!StringUtils.hasText(username)) {
            return;
        }
        sessions.entrySet().removeIf(entry -> entry.getValue().username().equals(username));
    }

    private void purgeExpired() {
        Instant now = Instant.now();
        sessions.entrySet().removeIf(entry -> entry.getValue().expiresAt().isBefore(now));
    }

    private record RefreshSession(String username, Instant expiresAt) {}
}
