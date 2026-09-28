package com.tranki.backend.card.domain;

import java.util.UUID;

public interface UserRepositoryPort {
    boolean existsById(UUID userId);
}
