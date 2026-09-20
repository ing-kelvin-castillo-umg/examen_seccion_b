package com.umg.examen.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TokenBlacklistServiceTest {

    private TokenBlacklistService blacklistService;

    @BeforeEach
    void setUp() {
        blacklistService = new TokenBlacklistService();
    }

    @Test
    @DisplayName("Añadir token a la lista negra y verificar que está revocado")
    void testBlacklistToken() {
        String token = "sample-token-123";
        long futureExpiration = System.currentTimeMillis() + 60000; // 1 min en el futuro

        assertFalse(blacklistService.isBlacklisted(token));
        blacklistService.blacklistToken(token, futureExpiration);
        assertTrue(blacklistService.isBlacklisted(token));
        assertEquals(1, blacklistService.size());
    }

    @Test
    @DisplayName("Token no revocado no debe figurar en lista negra")
    void testNonBlacklistedToken() {
        assertFalse(blacklistService.isBlacklisted("not-revoked-token"));
        assertFalse(blacklistService.isBlacklisted(null));
        assertFalse(blacklistService.isBlacklisted(""));
    }

    @Test
    @DisplayName("Tokens con expiración vencida deben eliminarse automáticamente")
    void testExpiredBlacklistedTokenIsCleanedUp() {
        String token = "expired-token";
        long pastExpiration = System.currentTimeMillis() - 1000; // 1 segundo en el pasado

        blacklistService.blacklistToken(token, pastExpiration);
        // Al consultar, detecta que ya venció naturalmente y retorna false
        assertFalse(blacklistService.isBlacklisted(token));
    }
}
