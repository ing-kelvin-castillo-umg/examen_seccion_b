package com.umg.examen.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Respuesta con un access token renovado")
public class RefreshTokenResponse {

    @Schema(description = "Nuevo access token JWT")
    private String accessToken;

    @Schema(description = "Tipo de autorización", example = "Bearer")
    private String type = "Bearer";

    public RefreshTokenResponse() {}

    public RefreshTokenResponse(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
