package com.umg.examen.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;
    // Clave secreta válida de 256 bits (Base64)
    private final String secretKey = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(tokenProvider, "jwtSecret", secretKey);
        ReflectionTestUtils.setField(tokenProvider, "jwtExpirationMs", 900000L); // 15 min
        ReflectionTestUtils.setField(tokenProvider, "refreshExpirationMs", 604800000L); // 7 días
    }

    @Test
    @DisplayName("Generar y validar Access Token exitosamente")
    void testGenerateAndValidateAccessToken() {
        String username = "admin";
        List<String> roles = List.of("ROLE_ADMIN");

        String token = tokenProvider.generateTokenFromUsername(username, roles);
        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));
        assertEquals(username, tokenProvider.getUsernameFromJwt(token));
    }

    @Test
    @DisplayName("Generar y validar Refresh Token exitosamente")
    void testGenerateAndValidateRefreshToken() {
        String username = "admin";

        String refreshToken = tokenProvider.generateRefreshTokenFromUsername(username);
        assertNotNull(refreshToken);
        assertTrue(tokenProvider.validateRefreshToken(refreshToken));
        assertEquals(username, tokenProvider.getUsernameFromJwt(refreshToken));
    }

    @Test
    @DisplayName("Seguridad: Un Access Token no debe ser aceptado como Refresh Token")
    void testAccessTokenRejectedAsRefreshToken() {
        String token = tokenProvider.generateTokenFromUsername("user", List.of("ROLE_USER"));
        assertFalse(tokenProvider.validateRefreshToken(token), "El validador de refresh token debe rechazar un access token");
    }

    @Test
    @DisplayName("Seguridad: Un Refresh Token no debe ser aceptado como Access Token")
    void testRefreshTokenRejectedAsAccessToken() {
        String refreshToken = tokenProvider.generateRefreshTokenFromUsername("user");
        assertFalse(tokenProvider.validateToken(refreshToken), "El validador de access token debe rechazar un refresh token");
    }

    @Test
    @DisplayName("Rechazar token manipulado o con firma inválida")
    void testTamperedTokenFailsValidation() {
        String validToken = tokenProvider.generateRefreshTokenFromUsername("admin");
        String tamperedToken = validToken + "tampered";

        assertFalse(tokenProvider.validateRefreshToken(tamperedToken));
        assertFalse(tokenProvider.validateToken(tamperedToken));
    }
}
