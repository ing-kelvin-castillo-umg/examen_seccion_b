package com.umg.examen.service.impl;

import com.umg.examen.entity.RefreshToken;
import com.umg.examen.entity.User;
import com.umg.examen.exception.TokenRefreshException;
import com.umg.examen.repository.RefreshTokenRepository;
import com.umg.examen.service.RefreshTokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenServiceImpl.class);

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    public RefreshTokenServiceImpl(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Override
    @Transactional
    public RefreshToken create(User user) {
        RefreshToken refreshToken = new RefreshToken(
                UUID.randomUUID().toString(),
                user,
                Instant.now().plusMillis(refreshExpirationMs)
        );
        return refreshTokenRepository.save(refreshToken);
    }

    // noRollbackFor: la revocación por reuso/expiración debe persistir aunque se responda con error.
    @Override
    @Transactional(noRollbackFor = TokenRefreshException.class)
    public RefreshToken rotate(String token) {
        RefreshToken current = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new TokenRefreshException("El refresh token no existe. Inicia sesión nuevamente."));

        if (Boolean.TRUE.equals(current.getRevoked())) {
            // Reutilizar un token ya rotado es señal de posible robo: se invalida toda la sesión del usuario.
            log.warn("Intento de reutilizar un refresh token revocado del usuario '{}'. Revocando todos sus tokens.",
                    current.getUser().getUsername());
            refreshTokenRepository.revokeAllByUser(current.getUser());
            throw new TokenRefreshException("El refresh token fue revocado. Inicia sesión nuevamente.");
        }

        if (current.isExpired()) {
            current.setRevoked(true);
            refreshTokenRepository.save(current);
            throw new TokenRefreshException("El refresh token expiró. Inicia sesión nuevamente.");
        }

        // Rotación: el token usado queda revocado y se emite uno nuevo.
        current.setRevoked(true);
        refreshTokenRepository.save(current);
        RefreshToken next = create(current.getUser());
        log.info("Refresh token rotado para el usuario '{}'", current.getUser().getUsername());
        return next;
    }

    @Override
    @Transactional
    public void revoke(String token) {
        refreshTokenRepository.findByToken(token).ifPresent(rt -> {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }

    @Override
    @Transactional
    public void revokeAllForUser(User user) {
        int count = refreshTokenRepository.revokeAllByUser(user);
        log.info("Se revocaron {} refresh token(s) del usuario '{}'", count, user.getUsername());
    }

    @Override
    public long getRefreshExpirationMs() {
        return refreshExpirationMs;
    }
}
