package com.umg.examen.service.impl;

import com.umg.examen.dto.request.LoginRequest;
import com.umg.examen.dto.request.RefreshTokenRequest;
import com.umg.examen.dto.response.AuthResponse;
import com.umg.examen.dto.response.UserResponse;
import com.umg.examen.entity.Role;
import com.umg.examen.entity.User;
import com.umg.examen.mapper.UserMapper;
import com.umg.examen.repository.UserRepository;
import com.umg.examen.security.JwtTokenProvider;
import com.umg.examen.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

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
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + request.getUsername()));

        return userMapper.toAuthResponse(user, token, refreshToken);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        if (!tokenProvider.validateRefreshToken(refreshToken)) {
            throw new BadCredentialsException("Refresh token inválido o expirado");
        }

        String username = tokenProvider.getUsernameFromJwt(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        if (Boolean.FALSE.equals(user.getEnabled())) {
            throw new BadCredentialsException("La cuenta de usuario está inhabilitada");
        }

        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        String newAccessToken = tokenProvider.generateTokenFromUsername(username, roles);
        String newRefreshToken = tokenProvider.generateRefreshTokenFromUsername(username);

        return userMapper.toAuthResponse(user, newAccessToken, newRefreshToken);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));
        return userMapper.toResponse(user);
    }
}

