package com.umg.examen.service;

import com.umg.examen.entity.User;

public interface RefreshTokenService {

    /** Crea un refresh token nuevo para el usuario y devuelve su valor en claro (solo se guarda el hash). */
    String create(User user);

    /** Valida el token, lo revoca (un solo uso) y emite uno nuevo. Lanza InvalidRefreshTokenException si no es válido. */
    RotatedRefreshToken rotate(String rawToken);

    long getRefreshExpirationSeconds();

    record RotatedRefreshToken(User user, String refreshToken) {}
}
