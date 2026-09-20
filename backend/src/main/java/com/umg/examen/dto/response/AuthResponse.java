package com.umg.examen.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Respuesta de autenticación con access token y refresh token")
public class AuthResponse {

    @Schema(description = "Access token JWT de corta duración")
    private String accessToken;

    @Schema(description = "Refresh token JWT de mayor duración")
    private String refreshToken;

    @Schema(description = "Tipo de autorización", example = "Bearer")
    private String type = "Bearer";

    @Schema(description = "Nombre de usuario", example = "admin")
    private String username;

    @Schema(description = "Nombre completo del usuario", example = "Administrador del Sistema")
    private String fullName;

    @Schema(description = "Correo electrónico", example = "admin@umg.edu.gt")
    private String email;

    @Schema(description = "Lista de roles asignados", example = "[\"ROLE_ADMIN\"]")
    private List<String> roles;

    public AuthResponse() {}

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}
