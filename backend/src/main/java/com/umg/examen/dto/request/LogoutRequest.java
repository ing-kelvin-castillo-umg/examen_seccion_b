package com.umg.examen.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Petición de cierre de sesión (el cuerpo es opcional)")
public class LogoutRequest {

    @Schema(description = "Refresh token de la sesión a cerrar; permite cerrar sesión aunque el access token ya haya expirado")
    private String refreshToken;

    public LogoutRequest() {}

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
