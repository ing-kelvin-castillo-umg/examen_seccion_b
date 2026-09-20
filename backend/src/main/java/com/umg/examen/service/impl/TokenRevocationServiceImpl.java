package com.umg.examen.service.impl;

import com.umg.examen.entity.RevokedAccessToken;
import com.umg.examen.repository.RevokedAccessTokenRepository;
import com.umg.examen.service.TokenRevocationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class TokenRevocationServiceImpl implements TokenRevocationService {

    private static final Logger log = LoggerFactory.getLogger(TokenRevocationServiceImpl.class);

    private final RevokedAccessTokenRepository repository;

    public TokenRevocationServiceImpl(RevokedAccessTokenRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public void revoke(String jti, LocalDateTime expiresAt) {
        if (jti == null || jti.isBlank() || repository.existsById(jti)) {
            return;
        }
        repository.save(new RevokedAccessToken(jti, expiresAt));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isRevoked(String jti) {
        return jti != null && repository.existsById(jti);
    }

    // Una entrada revocada ya no aporta nada cuando el JWT habría expirado igualmente.
    @Scheduled(fixedDelayString = "${app.jwt.revoked-cleanup-ms:3600000}", initialDelayString = "${app.jwt.revoked-cleanup-ms:3600000}")
    @Transactional
    public void purgeExpired() {
        int deleted = repository.deleteExpired(LocalDateTime.now());
        if (deleted > 0) {
            log.info("Access tokens revocados expirados eliminados: {}", deleted);
        }
    }
}
