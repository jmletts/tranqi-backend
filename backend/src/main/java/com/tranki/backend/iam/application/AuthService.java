package com.tranki.backend.iam.application;

import com.tranki.backend.iam.adapter.in.web.dto.LoginRequestDTO;
import com.tranki.backend.iam.adapter.in.web.dto.RegisterRequestDTO;
import com.tranki.backend.iam.adapter.in.web.dto.UpdateProfileRequestDTO;
import com.tranki.backend.iam.adapter.in.web.dto.UserProfileResponseDTO;
import com.tranki.backend.iam.domain.Dni;
import com.tranki.backend.iam.domain.Email;
import com.tranki.backend.iam.domain.PasswordHash;
import com.tranki.backend.iam.domain.Role;
import com.tranki.backend.iam.domain.User;
import com.tranki.backend.iam.domain.UserRepository;
import com.tranki.backend.iam.infrastructure.security.JwtTokenProvider;
import com.tranki.backend.shared.infrastructure.exception.UnauthorizedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthService implements AuthUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Override
    public void registerUser(RegisterRequestDTO request) {
        Dni dni = new Dni(request.getDni());
        
        if (userRepository.existsByDni(dni)) {
            throw new IllegalArgumentException("User with this DNI already exists");
        }

        User user = User.registerNewUser(
                dni,
                request.getName(),
                request.getPhone(),
                new Email(request.getEmail()),
                request.getAge(),
                request.getAddress(),
                request.getBaseFare(),
                new PasswordHash(passwordEncoder.encode(request.getPassword()))
        );

        userRepository.save(user);
    }

    @Override
    public String login(LoginRequestDTO request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getDni(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UUID userId = userRepository.findByDni(new Dni(request.getDni()))
                .map(User::getId)
                .orElse(null);

        return tokenProvider.generateToken(authentication, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponseDTO getProfileByDni(String dni) {
        User user = userRepository.findByDni(new Dni(dni))
                .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado para el token actual"));
        return toProfileDto(user);
    }

    @Override
    @Transactional
    public UserProfileResponseDTO updateProfileByDni(String dni, UpdateProfileRequestDTO request) {
        User user = userRepository.findByDni(new Dni(dni))
                .orElseThrow(() -> new UnauthorizedException("Usuario no encontrado para el token actual"));

        Email nextEmail = (request.email() != null && !request.email().isBlank())
                ? new Email(request.email().trim())
                : null;

        user.updateProfile(request.name(), request.phone(), nextEmail, request.address());
        userRepository.save(user);
        return toProfileDto(user);
    }

    private UserProfileResponseDTO toProfileDto(User user) {
        return new UserProfileResponseDTO(
                user.getId(),
                user.getDni().getValue(),
                user.getName(),
                user.getPhone(),
                user.getEmail().getValue(),
                user.getAge(),
                user.getAddress(),
                user.getBaseFare() != null ? user.getBaseFare().name() : "GENERAL",
                user.getRoles().stream().map(Role::name).toList()
        );
    }
}
