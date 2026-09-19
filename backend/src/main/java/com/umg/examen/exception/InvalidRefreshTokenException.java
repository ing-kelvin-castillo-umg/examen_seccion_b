package com.umg.examen.exception;

/**
 * Se lanza cuando un refresh token no existe, está revocado o ya expiró.
 * El GlobalExceptionHandler la traduce a un 401 con un mensaje claro para
 * que el frontend sepa que debe redirigir al login.
 */
public class InvalidRefreshTokenException extends RuntimeException {
    public InvalidRefreshTokenException(String message) {
        super(message);
    }
}
