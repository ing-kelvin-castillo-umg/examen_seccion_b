package com.umg.examen.dto.request;
 
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
 
@Schema(description = "Solicitud para refrescar token de acceso")
public class RefreshTokenRequest {
 
    @NotBlank(message = "El refresh token es obligatorio")
    @Schema(description = "Refresh token previamente emitido", example = "eyJhbGciOiJIUzM4NCJ9...")
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
