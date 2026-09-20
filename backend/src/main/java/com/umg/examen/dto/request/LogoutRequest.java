package com.umg.examen.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Solicitud opcional de cierre de sesión")
public class LogoutRequest {

    @Schema(description = "Motivo del cierre de sesión", example = "inactivity")
    private String reason;

    public LogoutRequest() {}

    public LogoutRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
