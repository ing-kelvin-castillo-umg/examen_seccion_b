package com.umg.examen.service;

import com.umg.examen.dto.request.LoginRequest;
import com.umg.examen.dto.response.AuthResponse;
import com.umg.examen.dto.response.UserResponse;

import com.umg.examen.dto.request.RefreshTokenRequest;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    UserResponse getCurrentUser(String username);
    AuthResponse refresh(RefreshTokenRequest request);
    void logout(RefreshTokenRequest request);
}
