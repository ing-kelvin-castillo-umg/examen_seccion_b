package com.umg.examen.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
public record LogoutRequest(
    @NotBlank @Size(max = 4096) String token,
    @NotBlank @Pattern(regexp = "manual|inactivity") String reason) {}
