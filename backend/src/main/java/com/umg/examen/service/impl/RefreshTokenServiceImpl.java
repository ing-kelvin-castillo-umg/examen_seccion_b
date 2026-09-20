package com.umg.examen.service.impl;

import com.umg.examen.entity.RefreshToken;
import com.umg.examen.entity.User;
import com.umg.examen.repository.RefreshTokenRepository;
import com.umg.examen.security.InvalidRefreshTokenException;
import com.umg.examen.service.RefreshTokenService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final RefreshTokenRepository repository;

    @Value("${app.jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    public RefreshTokenServiceImpl(RefreshTokenRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public String create(User user) {
        String raw = generateRawToken();
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(getRefreshExpirationSeconds());
        repository.save(new RefreshToken(user, hash(raw), expiresAt));
        return raw;
    }

    // noRollbackFor: la revocación por reutilización debe persistir aunque se lance la excepción.
    @Override
    @Transactional(noRollbackFor = InvalidRefreshTokenException.class)
    public RotatedRefreshToken rotate(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new InvalidRefreshTokenException();
        }

        RefreshToken stored = repository.findByTokenHash(hash(rawToken))
                .orElseThrow(InvalidRefreshTokenException::new);
        User user = stored.getUser();

        if (Boolean.TRUE.equals(stored.getRevoked())) {
            // Token ya usado: posible robo. Se revocan todas las sesiones del usuario.
            repository.revokeAllByUserId(user.getId());
            throw new InvalidRefreshTokenException();
        }
        if (stored.getExpiresAt().isBefore(LocalDateTime.now()) || !Boolean.TRUE.equals(user.getEnabled())) {
            throw new InvalidRefreshTokenException();
        }
        if (repository.revokeIfActive(stored.getId()) == 0) {
            repository.revokeAllByUserId(user.getId());
            throw new InvalidRefreshTokenException();
        }

        return new RotatedRefreshToken(user, create(user));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Long> findUserId(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return Optional.empty();
        }
        return repository.findByTokenHash(hash(rawToken)).map(t -> t.getUser().getId());
    }

    @Override
    @Transactional
    public void revokeAllForUser(Long userId) {
        repository.revokeAllByUserId(userId);
    }

    @Override
    public long getRefreshExpirationSeconds() {
        return refreshExpirationMs / 1000;
    }

    private static String generateRawToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hash(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(raw.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 no disponible", e);
        }
    }
}
