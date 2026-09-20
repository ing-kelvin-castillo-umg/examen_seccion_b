package com.umg.examen.security;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RevokedRefreshTokenStore {

    private final Map<String, Long> revokedTokenExpirations = new ConcurrentHashMap<>();

    public void revoke(String tokenId, long expirationTime) {
        removeExpiredEntries();
        revokedTokenExpirations.putIfAbsent(tokenId, expirationTime);
    }

    public boolean isRevoked(String tokenId) {
        Long expirationTime = revokedTokenExpirations.get(tokenId);
        if (expirationTime == null) {
            return false;
        }

        if (expirationTime <= System.currentTimeMillis()) {
            revokedTokenExpirations.remove(tokenId, expirationTime);
            return false;
        }

        return true;
    }

    private void removeExpiredEntries() {
        long now = System.currentTimeMillis();
        revokedTokenExpirations.entrySet().removeIf(entry -> entry.getValue() <= now);
    }
}
