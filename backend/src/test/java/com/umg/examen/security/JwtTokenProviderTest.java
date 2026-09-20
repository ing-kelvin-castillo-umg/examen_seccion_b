package com.umg.examen.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtTokenProviderTest {

    private static final String SECRET =
            "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    private JwtTokenProvider tokenProvider;
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(tokenProvider, "jwtSecret", SECRET);
        ReflectionTestUtils.setField(tokenProvider, "accessTokenExpirationMs", 120_000L);
        ReflectionTestUtils.setField(tokenProvider, "refreshTokenExpirationMs", 1_800_000L);

        User principal = new User(
                "admin",
                "password",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );
        authentication = new UsernamePasswordAuthenticationToken(
                principal,
                null,
                principal.getAuthorities()
        );
    }

    @Test
    void accessTokenIsAcceptedOnlyAsAccessToken() {
        String accessToken = tokenProvider.generateAccessToken(authentication);

        assertTrue(tokenProvider.validateAccessToken(accessToken));
        assertFalse(tokenProvider.validateRefreshToken(accessToken));
        assertEquals("admin", tokenProvider.getUsernameFromJwt(accessToken));
    }

    @Test
    void refreshTokenIsAcceptedOnlyAsRefreshToken() {
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        assertTrue(tokenProvider.validateRefreshToken(refreshToken));
        assertFalse(tokenProvider.validateAccessToken(refreshToken));
        assertEquals("admin", tokenProvider.getUsernameFromJwt(refreshToken));
        assertNotNull(tokenProvider.getTokenIdFromJwt(refreshToken));
    }

    @Test
    void eachRefreshTokenHasAUniqueIdentifier() {
        String firstRefreshToken = tokenProvider.generateRefreshToken(authentication);
        String secondRefreshToken = tokenProvider.generateRefreshToken(authentication);

        assertNotEquals(
                tokenProvider.getTokenIdFromJwt(firstRefreshToken),
                tokenProvider.getTokenIdFromJwt(secondRefreshToken)
        );
    }

    @Test
    void expiredRefreshTokenIsRejected() {
        ReflectionTestUtils.setField(tokenProvider, "refreshTokenExpirationMs", -1L);

        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        assertFalse(tokenProvider.validateRefreshToken(refreshToken));
    }

    @Test
    void alteredTokenIsRejected() {
        String refreshToken = tokenProvider.generateRefreshToken(authentication);
        String alteredToken = refreshToken.substring(0, refreshToken.length() - 1) + "x";

        assertFalse(tokenProvider.validateRefreshToken(alteredToken));
    }
}
