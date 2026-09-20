package com.umg.examen.security;

import org.junit.jupiter.api.Test;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RefreshTokenRevocationServiceTest {

    private final RefreshTokenRevocationService revocationService =
            new RefreshTokenRevocationService();

    @Test
    void revokedTokenRemainsRevokedUntilItsExpiration() {
        String tokenId = "refresh-token-id";

        revocationService.revoke(tokenId, new Date(System.currentTimeMillis() + 60_000));

        assertTrue(revocationService.isRevoked(tokenId));
        revocationService.revoke(tokenId, new Date(System.currentTimeMillis() + 60_000));
        assertTrue(revocationService.isRevoked(tokenId));
    }

    @Test
    void expiredRevocationIsDiscarded() {
        String tokenId = "expired-refresh-token-id";

        revocationService.revoke(tokenId, new Date(System.currentTimeMillis() - 1));

        assertFalse(revocationService.isRevoked(tokenId));
        assertFalse(revocationService.isRevoked("unknown-token-id"));
    }
}
