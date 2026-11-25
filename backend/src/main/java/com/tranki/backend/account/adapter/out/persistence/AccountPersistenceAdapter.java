package com.tranki.backend.account.adapter.out.persistence;

import com.tranki.backend.account.domain.Account;
import com.tranki.backend.account.domain.AccountRepository;
import com.tranki.backend.shared.domain.Money;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class AccountPersistenceAdapter implements AccountRepository {
    private final AccountJpaRepository repository;

    public AccountPersistenceAdapter(AccountJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Account save(Account account) {
        AccountJpaEntity entity = new AccountJpaEntity();
        entity.setAccountId(account.getAccountId());
        entity.setBalance(account.getBalance().amount());
        entity.setDebtMarginLimit(account.getDebtMarginLimit().amount());
        entity.setStatus(account.getStatus());
        entity.setUserId(account.getUserId());
        entity.setFareCategory(account.getFareCategory());
        
        repository.save(entity);
        return account;
    }

    @Override
    public Optional<Account> findById(UUID accountId) {
        return repository.findById(accountId).map(this::toDomain);
    }

    @Override
    public List<Account> findByUserId(UUID userId) {
        return repository.findByUserId(userId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    private Account toDomain(AccountJpaEntity entity) {
        return new Account(
            entity.getAccountId(),
            new Money(entity.getBalance()),
            new Money(entity.getDebtMarginLimit()),
            entity.getStatus(),
            entity.getUserId(),
            entity.getFareCategory()
        );
    }
}
