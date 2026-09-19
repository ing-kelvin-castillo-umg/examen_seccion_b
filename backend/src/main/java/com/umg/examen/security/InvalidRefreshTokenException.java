package com.umg.examen.security;

/** Refresh token inexistente, expirado, revocado o reutilizado. Se traduce a HTTP 401. */
public class InvalidRefreshTokenException extends RuntimeException {

    public InvalidRefreshTokenException() {
        super("Refresh token inválido, expirado o revocado");
    }
}
