package com.tranki.backend.card.adapter.out.persistence;

import com.tranki.backend.card.domain.CardStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CardJpaRepository extends JpaRepository<CardJpaEntity, String> {
    boolean existsByVerificationNumber(String verificationNumber);
    Optional<CardJpaEntity> findByAccountId(UUID accountId);
    Optional<CardJpaEntity> findByVerificationNumber(String verificationNumber);
    Optional<CardJpaEntity> findByCardIdIgnoreCase(String cardId);
    List<CardJpaEntity> findByCardStatusOrderByCardIdAsc(CardStatus cardStatus);
}
