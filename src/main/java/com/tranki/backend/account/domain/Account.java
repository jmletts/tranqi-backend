package com.tranki.backend.account.domain;

import com.tranki.backend.shared.domain.Money;
import java.util.UUID;

public class Account {
    private final UUID accountId;
    private Money balance;
    private final Money debtMarginLimit;
    private AccountStatus status;
    private UUID userId;
    private FareCategory fareCategory;

    public Account(UUID accountId, Money balance, Money debtMarginLimit, AccountStatus status, UUID userId, FareCategory fareCategory) {
        this.accountId = accountId;
        this.balance = balance;
        this.debtMarginLimit = debtMarginLimit;
        this.status = status;
        this.userId = userId;
        this.fareCategory = fareCategory;
    }

    public static Account createAnonymous(UUID accountId, FareCategory fareCategory, Money initialBalance) {
        return new Account(
            accountId != null ? accountId : UUID.randomUUID(),
            initialBalance,
            Money.of("-3.00"), // Fixed debt margin limit per domain rules
            AccountStatus.ACTIVE,
            null, // Anonymous
            fareCategory
        );
    }

    public void changeFareCategory(FareCategory newCategory) {
        this.fareCategory = newCategory;
    }

    public void linkUser(UUID newUserId) {
        if (this.userId != null) {
            throw new IllegalStateException("Account is already linked to a user");
        }
        this.userId = newUserId;
    }

    public void addBalance(Money amount) {
        if (amount.amount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto a recargar debe ser mayor a cero");
        }
        this.balance = this.balance.add(amount);
    }

    public UUID getAccountId() { return accountId; }
    public Money getBalance() { return balance; }
    public Money getDebtMarginLimit() { return debtMarginLimit; }
    public AccountStatus getStatus() { return status; }
    public UUID getUserId() { return userId; }
    public FareCategory getFareCategory() { return fareCategory; }
}
