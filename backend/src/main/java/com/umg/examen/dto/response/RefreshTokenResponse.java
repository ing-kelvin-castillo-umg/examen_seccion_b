package com.umg.examen.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Nuevo token de acceso emitido desde un refresh token válido")
public class RefreshTokenResponse {

    private String token;
    private String type = "Bearer";

    public RefreshTokenResponse() {}

    public RefreshTokenResponse(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
