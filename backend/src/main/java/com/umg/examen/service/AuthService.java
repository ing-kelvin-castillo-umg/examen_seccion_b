package com.umg.examen.service;

import com.umg.examen.dto.request.LoginRequest;
import com.umg.examen.dto.request.LogoutRequest;
import com.umg.examen.dto.request.RefreshTokenRequest;
import com.umg.examen.dto.response.AuthResponse;
import com.umg.examen.dto.response.UserResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse refresh(RefreshTokenRequest request);

    /**
     * Cierre de sesión centralizado: invalida el access token (blacklist) y revoca
     * el refresh token. Es idempotente y no falla si el access token ya expiró.
     */
    void logout(String accessToken, LogoutRequest request, String clientIp);
    UserResponse getCurrentUser(String username);
}
