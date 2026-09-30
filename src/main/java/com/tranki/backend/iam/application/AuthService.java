package com.tranki.backend.iam.application;

import com.tranki.backend.iam.adapter.in.web.dto.LoginRequestDTO;
import com.tranki.backend.iam.adapter.in.web.dto.RegisterRequestDTO;
import com.tranki.backend.iam.domain.Dni;
import com.tranki.backend.iam.domain.Email;
import com.tranki.backend.iam.domain.PasswordHash;
import com.tranki.backend.iam.domain.User;
import com.tranki.backend.iam.domain.UserRepository;
import com.tranki.backend.iam.infrastructure.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
        return tokenProvider.generateToken(authentication);
    }
}
