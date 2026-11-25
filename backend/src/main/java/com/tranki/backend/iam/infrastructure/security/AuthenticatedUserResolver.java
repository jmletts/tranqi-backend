package com.tranki.backend.iam.infrastructure.security;

import com.tranki.backend.iam.domain.Dni;
import com.tranki.backend.iam.domain.User;
import com.tranki.backend.iam.domain.UserRepository;
import com.tranki.backend.shared.infrastructure.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class AuthenticatedUserResolver {

    private final UserRepository userRepository;

    public AuthenticatedUserResolver(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User requireAuthenticatedUser() {
        return getAuthenticatedUser()
                .orElseThrow(() -> new UnauthorizedException("Sesión no autenticada o token inválido"));
    }

    public Optional<User> getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return Optional.empty();
        }
        String dni = auth.getName();
        if (dni == null || dni.isBlank()) {
            return Optional.empty();
        }
        return userRepository.findByDni(new Dni(dni));
    }
}
