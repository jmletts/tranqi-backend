package com.tranki.backend.account.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface MovementJpaRepository extends JpaRepository<MovementJpaEntity, String> {
    List<MovementJpaEntity> findByAccountIdOrderByMovementDateDesc(UUID accountId);
}
