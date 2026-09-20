package com.umg.examen.service;

import com.umg.examen.dto.request.LoginRequest;
import com.umg.examen.dto.request.RefreshTokenRequest;
import com.umg.examen.dto.response.AuthResponse;
import com.umg.examen.entity.Role;
import com.umg.examen.entity.User;
import com.umg.examen.mapper.UserMapper;
import com.umg.examen.repository.UserRepository;
import com.umg.examen.security.JwtTokenProvider;
import com.umg.examen.security.TokenBlacklistService;
import com.umg.examen.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.Collections;
import java.util.Date;
import java.util.Optional;
import java.util.Set;


import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TokenBlacklistService tokenBlacklistService;

    @Spy
    private UserMapper userMapper;


    @InjectMocks
    private AuthServiceImpl authService;

    private User testUser;
    private Role testRole;

    @BeforeEach
    void setUp() {
        testRole = new Role(1L, "ROLE_ADMIN");
        testUser = new User();

        testUser.setId(1L);
        testUser.setUsername("admin");
        testUser.setFullName("Admin User");
        testUser.setEmail("admin@umg.edu.gt");
        testUser.setPassword("encoded_password");
        testUser.setEnabled(true);
        testUser.setRoles(Set.of(testRole));
    }

    @Test
    @DisplayName("Login debe retornar Access Token y Refresh Token")
    void testLoginReturnsBothTokens() {
        LoginRequest request = new LoginRequest("admin", "admin123");
        Authentication auth = mock(Authentication.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("mock-access-token");
        when(tokenProvider.generateRefreshToken(auth)).thenReturn("mock-refresh-token");
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(testUser));

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock-access-token", response.getToken());
        assertEquals("mock-refresh-token", response.getRefreshToken());
        assertEquals("admin", response.getUsername());
        assertTrue(response.getRoles().contains("ROLE_ADMIN"));
    }

    @Test
    @DisplayName("RefreshToken con token válido renueva las credenciales exitosamente")
    void testRefreshTokenSuccess() {
        RefreshTokenRequest request = new RefreshTokenRequest("valid-refresh-token");

        when(tokenProvider.validateRefreshToken("valid-refresh-token")).thenReturn(true);
        when(tokenProvider.getUsernameFromJwt("valid-refresh-token")).thenReturn("admin");
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(testUser));
        when(tokenProvider.generateTokenFromUsername(eq("admin"), any())).thenReturn("new-access-token");
        when(tokenProvider.generateRefreshTokenFromUsername("admin")).thenReturn("new-refresh-token");

        AuthResponse response = authService.refreshToken(request);

        assertNotNull(response);
        assertEquals("new-access-token", response.getToken());
        assertEquals("new-refresh-token", response.getRefreshToken());
        assertEquals("admin", response.getUsername());
    }

    @Test
    @DisplayName("RefreshToken con token inválido debe lanzar BadCredentialsException")
    void testRefreshTokenInvalidThrowsException() {
        RefreshTokenRequest request = new RefreshTokenRequest("invalid-token");

        when(tokenProvider.validateRefreshToken("invalid-token")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> authService.refreshToken(request));
        verify(userRepository, never()).findByUsername(any());
    }

    @Test
    @DisplayName("RefreshToken para usuario inhabilitado debe ser rechazado")
    void testRefreshTokenUserDisabledThrowsException() {
        testUser.setEnabled(false);
        RefreshTokenRequest request = new RefreshTokenRequest("valid-token-disabled-user");

        when(tokenProvider.validateRefreshToken("valid-token-disabled-user")).thenReturn(true);
        when(tokenProvider.getUsernameFromJwt("valid-token-disabled-user")).thenReturn("admin");
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(testUser));

        assertThrows(BadCredentialsException.class, () -> authService.refreshToken(request));
    }

    @Test
    @DisplayName("Logout debe registrar en lista negra el token válido")
    void testLogoutRevokesToken() {
        String token = "Bearer valid-token-to-revoke";
        Date futureDate = new Date(System.currentTimeMillis() + 60000);

        when(tokenProvider.validateToken("valid-token-to-revoke")).thenReturn(true);
        when(tokenProvider.getUsernameFromJwt("valid-token-to-revoke")).thenReturn("admin");
        when(tokenProvider.getExpirationDateFromJwt("valid-token-to-revoke")).thenReturn(futureDate);

        authService.logout(token, "inactivity");

        verify(tokenBlacklistService).blacklistToken("valid-token-to-revoke", futureDate.getTime());
    }
}

