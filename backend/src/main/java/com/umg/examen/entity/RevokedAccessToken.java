package com.umg.examen.entity;

import jakarta.persistence.*;

import java.time.Instant;

/**
 * Access token JWT revocado antes de su expiración (logout manual o por
 * inactividad). Se identifica por el claim "jti" del token.
 */
@Entity
@Table(name = "revoked_access_tokens")
public class RevokedAccessToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String jti;

    @Column(length = 50)
    private String username;

    @Column(nullable = false, length = 30)
    private String reason;

    @Column(name = "client_ip", length = 64)
    private String clientIp;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "revoked_at", updatable = false)
    private Instant revokedAt = Instant.now();

    public RevokedAccessToken() {}

    public RevokedAccessToken(String jti, String username, String reason, String clientIp, Instant expiresAt) {
        this.jti = jti;
        this.username = username;
        this.reason = reason;
        this.clientIp = clientIp;
        this.expiresAt = expiresAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getJti() {
        return jti;
    }

    public void setJti(String jti) {
        this.jti = jti;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getClientIp() {
        return clientIp;
    }

    public void setClientIp(String clientIp) {
        this.clientIp = clientIp;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Instant getRevokedAt() {
        return revokedAt;
    }

    public void setRevokedAt(Instant revokedAt) {
        this.revokedAt = revokedAt;
    }
}
