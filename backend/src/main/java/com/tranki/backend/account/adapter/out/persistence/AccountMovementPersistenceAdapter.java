package com.tranki.backend.account.adapter.out.persistence;

import com.tranki.backend.account.domain.AccountMovement;
import com.tranki.backend.account.domain.AccountMovementRepository;
import com.tranki.backend.shared.domain.Money;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class AccountMovementPersistenceAdapter implements AccountMovementRepository {

    private final MovementJpaRepository repository;

    public AccountMovementPersistenceAdapter(MovementJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<AccountMovement> findByAccountIdOrderByDateDesc(UUID accountId) {
        return repository.findByAccountIdOrderByMovementDateDesc(accountId)
                .stream()
                .map(entity -> new AccountMovement(
                        entity.getType(),
                        entity.getIdentifier(),
                        new Money(entity.getAmount()),
                        entity.getMovementDate(),
                        entity.getDetail()
                ))
                .collect(Collectors.toList());
    }
}
