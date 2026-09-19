package com.umg.examen.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Petición para renovar o invalidar una sesión")
public class RefreshTokenRequest {

    @Schema(description = "Refresh token opaco emitido durante el login")
    private String refreshToken;

    public RefreshTokenRequest() {}

    public RefreshTokenRequest(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
