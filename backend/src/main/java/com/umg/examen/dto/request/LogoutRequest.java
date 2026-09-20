package com.umg.examen.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Petición para cerrar una sesión e invalidar su cadena de refresh token")
public class LogoutRequest {

    @NotBlank(message = "El refresh token es obligatorio")
    @Schema(description = "Refresh token vigente de la sesión que se desea cerrar")
    private String refreshToken;

    public LogoutRequest() {}

    public LogoutRequest(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
