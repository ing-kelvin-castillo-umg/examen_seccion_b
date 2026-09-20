package com.umg.examen.security;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Stores revoked refresh-token identifiers while this backend instance is alive.
 * A production deployment with multiple instances should replace this in-memory
 * store with shared, persistent storage such as Redis or a database.
 */
@Component
public class RefreshTokenRevocationService {

    private final Map<String, Instant> revokedTokenExpirations = new ConcurrentHashMap<>();

    public void revoke(String tokenId, Date expiration) {
        removeExpiredEntries();
        revokedTokenExpirations.put(tokenId, expiration.toInstant());
    }

    public boolean isRevoked(String tokenId) {
        Instant expiration = revokedTokenExpirations.get(tokenId);
        if (expiration == null) {
            return false;
        }

        if (!expiration.isAfter(Instant.now())) {
            revokedTokenExpirations.remove(tokenId, expiration);
            return false;
        }

        return true;
    }

    private void removeExpiredEntries() {
        Instant now = Instant.now();
        revokedTokenExpirations.entrySet().removeIf(entry -> !entry.getValue().isAfter(now));
    }
}
