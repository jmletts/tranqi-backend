package com.tranki.backend.card.adapter.out.validator;

import com.tranki.backend.card.domain.UserRepositoryPort;
import org.springframework.stereotype.Component;
import java.util.UUID;

@Component
public class StubUserRepositoryAdapter implements UserRepositoryPort {
    @Override
    public boolean existsById(UUID userId) {
        return userId != null; // Para el test, cualquier UUID existe.
    }
}
