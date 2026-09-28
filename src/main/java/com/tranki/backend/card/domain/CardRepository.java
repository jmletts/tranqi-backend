package com.tranki.backend.card.domain;

import java.util.Optional;

public interface CardRepository {
    Card save(Card card);
    Optional<Card> findById(String cardId);
    Optional<Card> findByAccountId(java.util.UUID accountId);
    boolean existsByVerificationNumber(String verificationNumber);
}
