package com.umg.examen.service;

import java.time.LocalDateTime;

public interface TokenRevocationService {

    /** Invalida el access token identificado por su jti hasta que expire de forma natural. */
    void revoke(String jti, LocalDateTime expiresAt);

    /** true si el jti fue revocado. Los tokens antiguos sin jti (null) nunca figuran como revocados. */
    boolean isRevoked(String jti);
}
