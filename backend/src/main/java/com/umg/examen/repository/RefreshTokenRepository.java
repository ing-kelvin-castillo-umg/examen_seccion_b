package com.umg.examen.repository;

import com.umg.examen.entity.RefreshToken;
import com.umg.examen.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    /**
     * Revoca (marca revoked = true) todos los refresh tokens aún activos de un
     * usuario. Se usa en login (política de una sola sesión activa) y podrá
     * reutilizarse en la Fase 3 para el logout centralizado.
     */
    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revoked = true WHERE rt.user = :user AND rt.revoked = false")
    int revokeAllByUser(@Param("user") User user);
}
