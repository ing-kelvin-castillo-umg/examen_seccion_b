package com.umg.examen.service;

import com.umg.examen.entity.RefreshToken;
import com.umg.examen.entity.User;

public interface RefreshTokenService {

    /** Genera y persiste un nuevo refresh token para el usuario. */
    RefreshToken create(User user);

    /**
     * Valida el refresh token recibido (existe, no revocado, no expirado), lo
     * revoca y devuelve uno nuevo para el mismo usuario (rotación de tokens).
     */
    RefreshToken rotate(String token);

    /** Revoca un refresh token específico (idempotente). */
    void revoke(String token);

    /** Revoca todos los refresh tokens activos del usuario. */
    void revokeAllForUser(User user);

    /** Duración configurada del refresh token en milisegundos. */
    long getRefreshExpirationMs();
}
