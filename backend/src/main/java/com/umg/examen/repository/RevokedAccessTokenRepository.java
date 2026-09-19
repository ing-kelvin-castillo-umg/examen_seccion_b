package com.umg.examen.repository;

import com.umg.examen.entity.RevokedAccessToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface RevokedAccessTokenRepository extends JpaRepository<RevokedAccessToken, Long> {

    boolean existsByJti(String jti);

    @Modifying
    @Query("DELETE FROM RevokedAccessToken t WHERE t.expiresAt < :now")
    int deleteExpired(@Param("now") Instant now);
}
