package com.umg.examen.service;

import io.jsonwebtoken.Claims;

public interface TokenBlacklistService {

    /**
     * Registra el access token como revocado hasta su fecha de expiración natural.
     * Si el token ya expiró no es necesario almacenarlo.
     */
    void revoke(Claims claims, String reason, String clientIp);

    /** true si el identificador de token (jti) fue revocado. */
    boolean isRevoked(String jti);
}
