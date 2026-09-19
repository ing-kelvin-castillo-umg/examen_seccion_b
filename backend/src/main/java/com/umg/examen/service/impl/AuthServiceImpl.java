package com.umg.examen.service.impl;

import com.umg.examen.dto.request.LoginRequest;
import com.umg.examen.dto.response.AuthResponse;
import com.umg.examen.dto.response.UserResponse;
import com.umg.examen.entity.RefreshToken;
import com.umg.examen.entity.Role;
import com.umg.examen.entity.User;
import com.umg.examen.exception.InvalidRefreshTokenException;
import com.umg.examen.mapper.UserMapper;
import com.umg.examen.repository.RefreshTokenRepository;
import com.umg.examen.repository.UserRepository;
import com.umg.examen.security.JwtTokenProvider;
import com.umg.examen.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserMapper userMapper;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           JwtTokenProvider tokenProvider,
                           UserRepository userRepository,
                           RefreshTokenRepository refreshTokenRepository,
                           UserMapper userMapper) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String accessToken = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + request.getUsername()));

        // Política elegida: una sola sesión de refresh activa por usuario. Cada
        // login revoca los refresh tokens previos de ese usuario y emite uno
        // nuevo, en vez de acumular uno distinto por cada inicio de sesión.
        // Simplifica la revocación (y encaja con el logout centralizado de la
        // Fase 3), a costa de no soportar múltiples sesiones concurrentes por
        // dispositivo; para eso se necesitaría un refresh token por dispositivo
        // en vez de por usuario.
        refreshTokenRepository.revokeAllByUser(user);
        String refreshToken = createAndPersistRefreshToken(user);

        return userMapper.toAuthResponse(user, accessToken, refreshToken);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(String rawRefreshToken) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(rawRefreshToken)
                .orElseThrow(() -> new InvalidRefreshTokenException("Refresh token inválido"));

        if (Boolean.TRUE.equals(storedToken.getRevoked())) {
            throw new InvalidRefreshTokenException("Refresh token revocado. Inicia sesión nuevamente.");
        }
        if (storedToken.isExpired()) {
            throw new InvalidRefreshTokenException("Refresh token expirado. Inicia sesión nuevamente.");
        }

        User user = storedToken.getUser();

        // Rotación: el refresh token usado se revoca y se emite uno nuevo en su
        // lugar. Así, si un refresh token filtrado/robado llega a usarse, el
        // cliente legítimo detecta el problema en su siguiente refresh (el suyo
        // ya habrá quedado revocado), en vez de que el mismo token siga siendo
        // válido indefinidamente hasta su expiración natural (7 días).
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);
        String newRefreshToken = createAndPersistRefreshToken(user);

        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());
        String newAccessToken = tokenProvider.generateTokenFromUsername(user.getUsername(), roles);

        return userMapper.toAuthResponse(user, newAccessToken, newRefreshToken);
    }

    @Override
    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            log.info("Logout solicitado sin refresh token; no hay nada que revocar.");
            return;
        }

        refreshTokenRepository.findByToken(rawRefreshToken).ifPresentOrElse(storedToken -> {
            User user = storedToken.getUser();
            int revoked = refreshTokenRepository.revokeAllByUser(user);
            log.info("Logout: usuario '{}' cerró sesión. {} refresh token(s) revocado(s).",
                    user.getUsername(), revoked);
        }, () -> log.info("Logout: el refresh token recibido ya no existe (inválido o ya revocado); " +
                "se considera la sesión cerrada de todas formas."));
    }

    private String createAndPersistRefreshToken(User user) {
        String token = generateSecureRandomToken();
        LocalDateTime expiryDate = LocalDateTime.now().plus(refreshExpirationMs, ChronoUnit.MILLIS);
        RefreshToken refreshToken = new RefreshToken(token, user, expiryDate);
        refreshTokenRepository.save(refreshToken);
        return token;
    }

    /**
     * Token opaco (no JWT): 64 bytes aleatorios criptográficamente seguros,
     * codificados en Base64 URL-safe. No necesita ser auto-descriptivo como un
     * JWT porque su validez (existencia, expiración, revocación) siempre se
     * verifica contra la tabla refresh_tokens, nunca se decodifica ni se confía
     * en su contenido.
     */
    private String generateSecureRandomToken() {
        byte[] randomBytes = new byte[64];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}
