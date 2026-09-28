package com.tranki.backend.account.adapter.out.persistence;

import com.tranki.backend.account.domain.AccountStatus;
import com.tranki.backend.account.domain.FareCategory;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "accounts")
public class AccountJpaEntity {

    @Id
    private UUID accountId;
    private BigDecimal balance;
    private BigDecimal debtMarginLimit;
    
    @Enumerated(EnumType.STRING)
    private AccountStatus status;
    
    private UUID userId;
    
    @Enumerated(EnumType.STRING)
    private FareCategory fareCategory;

    // Getters, Setters, Constructors
    public AccountJpaEntity() {}

    public UUID getAccountId() { return accountId; }
    public void setAccountId(UUID accountId) { this.accountId = accountId; }
    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
    public BigDecimal getDebtMarginLimit() { return debtMarginLimit; }
    public void setDebtMarginLimit(BigDecimal debtMarginLimit) { this.debtMarginLimit = debtMarginLimit; }
    public AccountStatus getStatus() { return status; }
    public void setStatus(AccountStatus status) { this.status = status; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public FareCategory getFareCategory() { return fareCategory; }
    public void setFareCategory(FareCategory fareCategory) { this.fareCategory = fareCategory; }
}
