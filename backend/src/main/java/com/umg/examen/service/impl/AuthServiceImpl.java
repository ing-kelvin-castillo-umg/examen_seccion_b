package com.umg.examen.service.impl;

import com.umg.examen.dto.request.LoginRequest;
import com.umg.examen.dto.request.LogoutRequest;
import com.umg.examen.dto.request.RefreshTokenRequest;
import com.umg.examen.dto.response.AuthResponse;
import com.umg.examen.dto.response.UserResponse;
import com.umg.examen.entity.User;
import com.umg.examen.mapper.UserMapper;
import com.umg.examen.repository.UserRepository;
import com.umg.examen.security.JwtTokenProvider;
import com.umg.examen.security.InvalidRefreshTokenException;
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

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           JwtTokenProvider tokenProvider,
                           UserRepository userRepository,
                           UserMapper userMapper) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + request.getUsername()));

        Integer refreshVersion = rotateRefreshTokenVersion(user);
        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(user.getUsername(), refreshVersion);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Override
    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!tokenProvider.validateRefreshToken(refreshToken)) {
            throw new InvalidRefreshTokenException();
        }

        String username = tokenProvider.getUsernameFromJwt(refreshToken);
        Integer tokenVersion = tokenProvider.getRefreshTokenVersion(refreshToken);

        User user = userRepository.findByUsername(username)
                .orElseThrow(InvalidRefreshTokenException::new);

        if (!Boolean.TRUE.equals(user.getEnabled()) || !tokenVersion.equals(user.getRefreshTokenVersion())) {
            throw new InvalidRefreshTokenException();
        }

        Integer nextRefreshVersion = rotateRefreshTokenVersion(user);
        User refreshedUser = userRepository.findByUsername(username)
                .orElseThrow(InvalidRefreshTokenException::new);
        List<String> roles = refreshedUser.getRoles().stream()
                .map(role -> role.getName())
                .toList();

        String newAccessToken = tokenProvider.generateAccessToken(username, roles);
        String newRefreshToken = tokenProvider.generateRefreshToken(username, nextRefreshVersion);

        return buildAuthResponse(refreshedUser, newAccessToken, newRefreshToken);
    }

    @Override
    @Transactional
    public void logout(LogoutRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!tokenProvider.validateRefreshToken(refreshToken)) {
            throw new InvalidRefreshTokenException();
        }

        String username = tokenProvider.getUsernameFromJwt(refreshToken);
        Integer tokenVersion = tokenProvider.getRefreshTokenVersion(refreshToken);
        int updatedRows = userRepository.rotateRefreshTokenVersion(username, tokenVersion);

        if (updatedRows != 1) {
            throw new InvalidRefreshTokenException();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));
        return userMapper.toResponse(user);
    }

    private Integer rotateRefreshTokenVersion(User user) {
        Integer currentVersion = user.getRefreshTokenVersion();
        int updatedRows = userRepository.rotateRefreshTokenVersion(user.getUsername(), currentVersion);

        if (updatedRows != 1) {
            throw new InvalidRefreshTokenException();
        }

        return currentVersion + 1;
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return userMapper.toAuthResponse(
                user,
                accessToken,
                refreshToken,
                tokenProvider.getAccessTokenExpirationMs(),
                tokenProvider.getRefreshTokenExpirationMs()
        );
    }
}
