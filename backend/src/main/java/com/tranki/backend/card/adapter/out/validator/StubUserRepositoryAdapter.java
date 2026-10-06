package com.tranki.backend.card.adapter.out.validator;

import com.tranki.backend.card.domain.UserRepositoryPort;
import com.tranki.backend.iam.adapter.out.persistence.UserJpaRepository;
import org.springframework.stereotype.Component;
import java.util.UUID;

@Component
public class StubUserRepositoryAdapter implements UserRepositoryPort {
    
    private final UserJpaRepository userJpaRepository;

    public StubUserRepositoryAdapter(UserJpaRepository userJpaRepository) {
        this.userJpaRepository = userJpaRepository;
    }

    @Override
    public boolean existsById(UUID userId) {
        if (userId == null) return false;
        // Check if the user really exists, or for tests allow specific UUIDs.
        // Actually, we'll just use the real repository now.
        return userJpaRepository.existsById(userId);
    }
}
