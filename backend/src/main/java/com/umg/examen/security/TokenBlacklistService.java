package com.umg.examen.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    private static final Logger log = LoggerFactory.getLogger(TokenBlacklistService.class);

    // Mapa concurrente para almacenar tokens revocados y su timestamp de expiración
    private final Map<String, Long> blacklist = new ConcurrentHashMap<>();

    /**
     * Invalida un token añadiéndolo a la lista negra interna.
     *
     * @param token           JWT a revocar
     * @param expirationTimeMs Timestamp en milisegundos en que expira el token naturalmente
     */
    public void blacklistToken(String token, long expirationTimeMs) {
        if (token != null && !token.isBlank()) {
            blacklist.put(token, expirationTimeMs);
            log.debug("Token añadido a la lista negra de revocación.");
        }
    }

    /**
     * Verifica si un token se encuentra en la lista negra.
     *
     * @param token JWT a verificar
     * @return true si el token fue revocado previamente
     */
    public boolean isBlacklisted(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        Long expiration = blacklist.get(token);
        if (expiration == null) {
            return false;
        }
        // Si el token ya expiró en tiempo natural, se puede remover de memoria
        if (System.currentTimeMillis() > expiration) {
            blacklist.remove(token);
            return false;
        }
        return true;
    }

    /**
     * Tarea periódica cada 10 minutos para limpiar tokens cuya vigencia natural ya venció
     */
    @Scheduled(fixedRate = 600000)
    public void cleanupExpiredTokens() {
        long now = System.currentTimeMillis();
        blacklist.entrySet().removeIf(entry -> now > entry.getValue());
    }

    /**
     * Tamaño actual de tokens en lista negra (para monitoreo y tests)
     */
    public int size() {
        return blacklist.size();
    }
}
