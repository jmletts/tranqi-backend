package com.tranki.backend.iam.adapter.out.persistence;

import com.tranki.backend.iam.domain.Dni;
import com.tranki.backend.iam.domain.Email;
import com.tranki.backend.iam.domain.PasswordHash;
import com.tranki.backend.iam.domain.User;
import com.tranki.backend.iam.domain.UserRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class UserPersistenceAdapter implements UserRepository {

    private final UserJpaRepository jpaRepository;

    public UserPersistenceAdapter(UserJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public void save(User user) {
        UserJpaEntity entity = new UserJpaEntity(
                user.getId(),
                user.getDni().getValue(),
                user.getName(),
                user.getPhone(),
                user.getEmail().getValue(),
                user.getAge(),
                user.getAddress(),
                user.getBaseFare(),
                user.getPasswordHash().getValue(),
                user.getRoles()
        );
        jpaRepository.save(entity);
    }

    @Override
    public Optional<User> findByDni(Dni dni) {
        return jpaRepository.findByDni(dni.getValue())
                .map(this::mapToDomain);
    }

    @Override
    public boolean existsByDni(Dni dni) {
        return jpaRepository.existsByDni(dni.getValue());
    }

    private User mapToDomain(UserJpaEntity entity) {
        return new User(
                entity.getId(),
                new Dni(entity.getDni()),
                entity.getName(),
                entity.getPhone(),
                new Email(entity.getEmail()),
                entity.getAge(),
                entity.getAddress(),
                entity.getBaseFare(),
                new PasswordHash(entity.getPasswordHash()),
                entity.getRoles()
        );
    }
}
