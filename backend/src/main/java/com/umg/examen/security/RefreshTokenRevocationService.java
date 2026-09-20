package com.umg.examen.security;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RefreshTokenRevocationService {

    private final Map<String, Long> revokedTokens = new ConcurrentHashMap<>();

    public void revoke(String refreshToken, long expirationTimeMs) {
        removeExpiredEntries();
        revokedTokens.put(fingerprint(refreshToken), expirationTimeMs);
    }

    public boolean isRevoked(String refreshToken) {
        removeExpiredEntries();
        return revokedTokens.containsKey(fingerprint(refreshToken));
    }

    private void removeExpiredEntries() {
        long now = System.currentTimeMillis();
        revokedTokens.entrySet().removeIf(entry -> entry.getValue() <= now);
    }

    private String fingerprint(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 no está disponible", exception);
        }
    }
}
