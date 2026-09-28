package com.tranki.backend.card.adapter.out.persistence;

import com.tranki.backend.card.domain.Card;
import com.tranki.backend.card.domain.CardRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

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
        
        repository.save(entity);
        return card;
    }

    @Override
    public Optional<Card> findById(String cardId) {
        return repository.findById(cardId).map(entity -> new Card(
            entity.getCardId(),
            entity.getAccountId(),
            entity.getCardStatus(),
            entity.getVerificationNumber(),
            entity.getSecurityCodeHash(),
            entity.getKioskAgentId()
        ));
    }

    @Override
    public Optional<Card> findByAccountId(java.util.UUID accountId) {
        return repository.findByAccountId(accountId).map(entity -> new Card(
            entity.getCardId(),
            entity.getAccountId(),
            entity.getCardStatus(),
            entity.getVerificationNumber(),
            entity.getSecurityCodeHash(),
            entity.getKioskAgentId()
        ));
    }

    @Override
    public boolean existsByVerificationNumber(String verificationNumber) {
        return repository.existsByVerificationNumber(verificationNumber);
    }
}
