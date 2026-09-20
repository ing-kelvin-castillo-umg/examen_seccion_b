package com.umg.examen.service.impl;

import com.umg.examen.dto.request.LoginRequest;
import com.umg.examen.dto.request.RefreshTokenRequest;
import com.umg.examen.dto.response.AuthResponse;
import com.umg.examen.dto.response.RefreshTokenResponse;
import com.umg.examen.dto.response.UserResponse;
import com.umg.examen.entity.User;
import com.umg.examen.exception.InvalidRefreshTokenException;
import com.umg.examen.mapper.UserMapper;
import com.umg.examen.repository.UserRepository;
import com.umg.examen.security.JwtTokenProvider;
import com.umg.examen.security.RefreshTokenRevocationService;
import com.umg.examen.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final RefreshTokenRevocationService refreshTokenRevocationService;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           JwtTokenProvider tokenProvider,
                           UserRepository userRepository,
                           UserMapper userMapper,
                           RefreshTokenRevocationService refreshTokenRevocationService) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.refreshTokenRevocationService = refreshTokenRevocationService;
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + request.getUsername()));

        return userMapper.toAuthResponse(user, accessToken, refreshToken);
    }

    @Override
    @Transactional(readOnly = true)
    public RefreshTokenResponse refresh(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!tokenProvider.validateRefreshToken(refreshToken)) {
            throw new InvalidRefreshTokenException("Refresh token inválido o expirado");
        }

        String tokenId = tokenProvider.getTokenIdFromJwt(refreshToken);
        if (tokenId == null || refreshTokenRevocationService.isRevoked(tokenId)) {
            throw new InvalidRefreshTokenException("Refresh token revocado o sin identificador valido");
        }

        String username = tokenProvider.getUsernameFromJwt(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new InvalidRefreshTokenException("El usuario del refresh token ya no es válido"));

        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new InvalidRefreshTokenException("El usuario del refresh token está deshabilitado");
        }

        List<String> roles = user.getRoles().stream()
                .map(role -> role.getName())
                .toList();
        String accessToken = tokenProvider.generateAccessTokenFromUsername(user.getUsername(), roles);

        return new RefreshTokenResponse(accessToken);
    }

    @Override
    public void logout(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!tokenProvider.validateRefreshToken(refreshToken)) {
            throw new InvalidRefreshTokenException("Refresh token invalido o expirado");
        }

        String tokenId = tokenProvider.getTokenIdFromJwt(refreshToken);
        if (tokenId == null) {
            throw new InvalidRefreshTokenException("Refresh token sin identificador valido");
        }

        refreshTokenRevocationService.revoke(
                tokenId,
                tokenProvider.getExpirationFromJwt(refreshToken)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));
        return userMapper.toResponse(user);
    }
}
