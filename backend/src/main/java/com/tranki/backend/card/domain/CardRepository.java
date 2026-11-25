package com.tranki.backend.card.domain;

import java.util.Optional;
import java.util.UUID;

public interface CardRepository {
    Card save(Card card);
    Optional<Card> findById(String cardId);
    Optional<Card> findByAccountId(UUID accountId);
    Optional<Card> findByVerificationNumber(String verificationNumber);
    boolean existsByVerificationNumber(String verificationNumber);
}
