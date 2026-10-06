package com.tranki.backend.iam.domain;

import java.util.Optional;

public interface UserRepository {
    void save(User user);
    Optional<User> findByDni(Dni dni);
    boolean existsByDni(Dni dni);
}
