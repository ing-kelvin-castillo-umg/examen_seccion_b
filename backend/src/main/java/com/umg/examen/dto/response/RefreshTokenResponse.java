package com.umg.examen.dto.response;

public class RefreshTokenResponse {
    private String accessToken;
    private String type;

    public RefreshTokenResponse(String accessToken, String type) {
        this.accessToken = accessToken;
        this.type = type;
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
