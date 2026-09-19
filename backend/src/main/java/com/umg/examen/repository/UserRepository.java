package com.umg.examen.repository;

import com.umg.examen.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE User u SET u.refreshTokenVersion = u.refreshTokenVersion + 1 " +
            "WHERE u.username = :username AND u.refreshTokenVersion = :currentVersion")
    int rotateRefreshTokenVersion(@Param("username") String username,
                                  @Param("currentVersion") Integer currentVersion);
}
