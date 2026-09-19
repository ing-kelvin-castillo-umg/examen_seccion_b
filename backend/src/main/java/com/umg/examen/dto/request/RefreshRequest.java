package com.umg.examen.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Petición de renovación de credenciales")
public class RefreshRequest {

    @NotBlank(message = "El refresh token es obligatorio")
    @Schema(description = "Refresh token opaco obtenido en el login o en el último refresh")
    private String refreshToken;

    public RefreshRequest() {}

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
