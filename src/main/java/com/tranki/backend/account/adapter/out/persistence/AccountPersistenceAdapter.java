package com.tranki.backend.account.adapter.out.persistence;

import com.tranki.backend.account.domain.Account;
import com.tranki.backend.account.domain.AccountRepository;
import com.tranki.backend.shared.domain.Money;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

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
        return repository.findById(accountId).map(entity -> new Account(
            entity.getAccountId(),
            new Money(entity.getBalance()),
            new Money(entity.getDebtMarginLimit()),
            entity.getStatus(),
            entity.getUserId(),
            entity.getFareCategory()
        ));
    }
}
