package com.umg.examen.service.impl;

import com.umg.examen.entity.RevokedAccessToken;
import com.umg.examen.repository.RevokedAccessTokenRepository;
import com.umg.examen.service.TokenBlacklistService;
import io.jsonwebtoken.Claims;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class TokenBlacklistServiceImpl implements TokenBlacklistService {

    private static final Logger log = LoggerFactory.getLogger(TokenBlacklistServiceImpl.class);

    private final RevokedAccessTokenRepository repository;

    public TokenBlacklistServiceImpl(RevokedAccessTokenRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public void revoke(Claims claims, String reason, String clientIp) {
        String jti = claims.getId();
        if (jti == null || claims.getExpiration() == null) {
            log.warn("Token sin jti/exp: no se puede registrar en la lista de revocación");
            return;
        }
        Instant expiresAt = claims.getExpiration().toInstant();
        if (expiresAt.isBefore(Instant.now())) {
            log.info("Logout de '{}' ({}): el access token ya había expirado, no se registra en la blacklist",
                    claims.getSubject(), reason);
            return;
        }
        if (repository.existsByJti(jti)) {
            return; // idempotente
        }
        try {
            repository.save(new RevokedAccessToken(jti, claims.getSubject(), reason, clientIp, expiresAt));
            log.info("Access token revocado: usuario='{}' motivo={} ip={} jti={}", claims.getSubject(), reason, clientIp, jti);
        } catch (DataIntegrityViolationException e) {
            // Dos logouts simultáneos del mismo token: ya está revocado.
            log.debug("El token jti={} ya estaba revocado", jti);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isRevoked(String jti) {
        return jti != null && repository.existsByJti(jti);
    }

    /** Depura periódicamente los registros cuyo token ya expiró por sí solo. */
    @Scheduled(fixedDelayString = "${app.jwt.blacklist-cleanup-ms:600000}")
    @Transactional
    public void purgeExpired() {
        int removed = repository.deleteExpired(Instant.now());
        if (removed > 0) {
            log.info("Blacklist depurada: {} token(s) expirado(s) eliminado(s)", removed);
        }
    }
}
