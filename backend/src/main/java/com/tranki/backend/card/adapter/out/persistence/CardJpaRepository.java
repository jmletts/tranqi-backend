package com.tranki.backend.card.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CardJpaRepository extends JpaRepository<CardJpaEntity, String> {
    boolean existsByVerificationNumber(String verificationNumber);
    java.util.Optional<CardJpaEntity> findByAccountId(java.util.UUID accountId);
}
