package com.tranki.backend.account.domain;

import com.tranki.backend.shared.domain.Money;
import java.time.LocalDateTime;
import java.util.UUID;

public class RechargeTransaction {
    private final String transactionId;
    private final UUID accountId;
    private final Money amount;
    private final String origin;
    private final LocalDateTime createdAt;

    public RechargeTransaction(String transactionId, UUID accountId, Money amount, String origin, LocalDateTime createdAt) {
        this.transactionId = transactionId;
        this.accountId = accountId;
        this.amount = amount;
        this.origin = origin;
        this.createdAt = createdAt;
    }

    public String getTransactionId() { return transactionId; }
    public UUID getAccountId() { return accountId; }
    public Money getAmount() { return amount; }
    public String getOrigin() { return origin; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
