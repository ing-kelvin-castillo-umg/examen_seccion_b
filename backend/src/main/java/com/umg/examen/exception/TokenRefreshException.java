package com.umg.examen.exception;

/**
 * Se lanza cuando un refresh token no puede utilizarse (inexistente, expirado o
 * revocado). Se traduce a HTTP 401 para que el cliente redirija al login.
 */
public class TokenRefreshException extends RuntimeException {

    public TokenRefreshException(String message) {
        super(message);
    }
}
