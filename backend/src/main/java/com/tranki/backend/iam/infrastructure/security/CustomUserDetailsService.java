package com.tranki.backend.iam.infrastructure.security;

import com.tranki.backend.iam.adapter.out.persistence.UserJpaEntity;
import com.tranki.backend.iam.adapter.out.persistence.UserJpaRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserJpaRepository userRepository;

    public CustomUserDetailsService(UserJpaRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String dni) throws UsernameNotFoundException {
        UserJpaEntity user = userRepository.findByDni(dni)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with DNI: " + dni));

        return new org.springframework.security.core.userdetails.User(
                user.getDni(),
                user.getPasswordHash(),
                user.getRoles().stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                        .collect(Collectors.toList())
        );
    }
}
