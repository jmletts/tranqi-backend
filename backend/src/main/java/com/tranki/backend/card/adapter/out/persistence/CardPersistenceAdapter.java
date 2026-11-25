package com.tranki.backend.card.adapter.out.persistence;

import com.tranki.backend.card.domain.Card;
import com.tranki.backend.card.domain.CardRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class CardPersistenceAdapter implements CardRepository {
    private final CardJpaRepository repository;

    public CardPersistenceAdapter(CardJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Card save(Card card) {
        CardJpaEntity entity = new CardJpaEntity();
        entity.setCardId(card.getCardId());
        entity.setAccountId(card.getAccountId());
        entity.setCardStatus(card.getCardStatus());
        entity.setVerificationNumber(card.getVerificationNumber());
        entity.setSecurityCodeHash(card.getSecurityCodeHash());
        entity.setKioskAgentId(card.getKioskAgentId());
        entity.setFailedLinkAttempts(card.getFailedLinkAttempts());
        entity.setAlias(card.getAlias());
        
        repository.save(entity);
        return card;
    }

    @Override
    public Optional<Card> findById(String cardId) {
        return repository.findById(cardId).map(this::toDomain);
    }

    @Override
    public Optional<Card> findByAccountId(UUID accountId) {
        return repository.findByAccountId(accountId).map(this::toDomain);
    }

    @Override
    public Optional<Card> findByVerificationNumber(String verificationNumber) {
        return repository.findByVerificationNumber(verificationNumber).map(this::toDomain);
    }

    @Override
    public boolean existsByVerificationNumber(String verificationNumber) {
        return repository.existsByVerificationNumber(verificationNumber);
    }

    private Card toDomain(CardJpaEntity entity) {
        return new Card(
            entity.getCardId(),
            entity.getAccountId(),
            entity.getCardStatus(),
            entity.getVerificationNumber(),
            entity.getSecurityCodeHash(),
            entity.getKioskAgentId(),
            entity.getFailedLinkAttempts() != null ? entity.getFailedLinkAttempts() : 0,
            entity.getAlias()
        );
    }
}
