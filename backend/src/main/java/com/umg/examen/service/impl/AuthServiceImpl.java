package com.umg.examen.service.impl;

import com.umg.examen.dto.request.LoginRequest;
import com.umg.examen.dto.request.LogoutRequest;
import com.umg.examen.dto.request.RefreshTokenRequest;
import com.umg.examen.dto.response.AuthResponse;
import com.umg.examen.dto.response.UserResponse;
import com.umg.examen.entity.RefreshToken;
import com.umg.examen.entity.Role;
import com.umg.examen.entity.User;
import com.umg.examen.exception.TokenRefreshException;
import com.umg.examen.mapper.UserMapper;
import com.umg.examen.repository.UserRepository;
import com.umg.examen.security.JwtTokenProvider;
import com.umg.examen.service.AuthService;
import com.umg.examen.service.RefreshTokenService;
import com.umg.examen.service.TokenBlacklistService;
import io.jsonwebtoken.Claims;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);
    private static final String DEFAULT_LOGOUT_REASON = "USER_LOGOUT";

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final RefreshTokenService refreshTokenService;
    private final TokenBlacklistService tokenBlacklistService;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           JwtTokenProvider tokenProvider,
                           UserRepository userRepository,
                           UserMapper userMapper,
                           RefreshTokenService refreshTokenService,
                           TokenBlacklistService tokenBlacklistService) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.refreshTokenService = refreshTokenService;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + request.getUsername()));

        RefreshToken refreshToken = refreshTokenService.create(user);
        return userMapper.toAuthResponse(user, token, refreshToken.getToken(), tokenProvider.getExpirationMs());
    }

    /**
     * Política de refresh token con rotación: el refresh token recibido se valida y
     * revoca, y se emite un nuevo par (access token JWT + refresh token). Si el
     * refresh token es inválido, expiró o fue revocado se responde 401 y el cliente
     * debe volver a iniciar sesión.
     */
    @Override
    @Transactional(noRollbackFor = TokenRefreshException.class)
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken rotated = refreshTokenService.rotate(request.getRefreshToken());
        User user = rotated.getUser();

        List<String> roles = user.getRoles().stream().map(Role::getName).toList();
        String newAccessToken = tokenProvider.generateTokenFromUsername(user.getUsername(), roles);

        return userMapper.toAuthResponse(user, newAccessToken, rotated.getToken(), tokenProvider.getExpirationMs());
    }

    @Override
    @Transactional
    public void logout(String accessToken, LogoutRequest request, String clientIp) {
        String reason = request != null && request.getReason() != null && !request.getReason().isBlank()
                ? request.getReason().trim().toUpperCase()
                : DEFAULT_LOGOUT_REASON;

        String username = null;

        // 1) Invalidar el access token (aunque haya expirado se leen sus claims para la bitácora).
        if (accessToken != null && !accessToken.isBlank()) {
            Optional<Claims> claims = tokenProvider.getClaimsAllowExpired(accessToken);
            if (claims.isPresent()) {
                username = claims.get().getSubject();
                tokenBlacklistService.revoke(claims.get(), reason, clientIp);
            }
        }

        // 2) Revocar el refresh token de esta sesión.
        if (request != null && request.getRefreshToken() != null && !request.getRefreshToken().isBlank()) {
            refreshTokenService.revoke(request.getRefreshToken());
        }

        log.info("Sesión cerrada: usuario='{}' motivo={} ip={}", username != null ? username : "desconocido", reason, clientIp);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));
        return userMapper.toResponse(user);
    }
}
