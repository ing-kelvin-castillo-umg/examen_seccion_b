package com.umg.examen.service;

import com.umg.examen.dto.request.LoginRequest;
import com.umg.examen.dto.response.AuthResponse;
import com.umg.examen.dto.response.UserResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    UserResponse getCurrentUser(String username);

    /**
     * Valida un refresh token (existe, no revocado, no expirado) y, si es válido,
     * lo rota (lo revoca y emite uno nuevo) junto con un access token nuevo.
     */
    AuthResponse refreshToken(String refreshToken);
}
