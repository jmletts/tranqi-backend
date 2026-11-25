package com.tranki.backend.agent.adapter.out.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "agent_transactions")
public class AgentTransactionJpaEntity {

    @Id
    private UUID id;

    @Column(name = "reference_code", unique = true, nullable = false, length = 64)
    private String referenceCode;

    @Column(name = "agent_user_id", nullable = false)
    private UUID agentUserId;

    @Column(name = "type", nullable = false, length = 32)
    private String type; // RECHARGE | REPLENISHMENT | REJECTED | CARD_ISSUE

    @Column(name = "card_id", nullable = false, length = 64)
    private String cardId;

    @Column(name = "card_holder", nullable = false, length = 160)
    private String cardHolder;

    @Column(name = "fare_category", nullable = false, length = 32)
    private String fareCategory;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "previous_balance", precision = 12, scale = 2)
    private BigDecimal previousBalance;

    @Column(name = "new_balance", precision = 12, scale = 2)
    private BigDecimal newBalance;

    @Column(name = "payment_method", nullable = false, length = 64)
    private String paymentMethod;

    @Column(name = "status", nullable = false, length = 32)
    private String status; // COMPLETADO | RECHAZADO

    @Column(name = "unlocked_debt", nullable = false)
    private boolean unlockedDebt;

    @Column(name = "notes", length = 320)
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public AgentTransactionJpaEntity() {}

    public AgentTransactionJpaEntity(
            UUID id,
            String referenceCode,
            UUID agentUserId,
            String type,
            String cardId,
            String cardHolder,
            String fareCategory,
            BigDecimal amount,
            BigDecimal previousBalance,
            BigDecimal newBalance,
            String paymentMethod,
            String status,
            boolean unlockedDebt,
            String notes,
            LocalDateTime createdAt) {
        this.id = id;
        this.referenceCode = referenceCode;
        this.agentUserId = agentUserId;
        this.type = type;
        this.cardId = cardId;
        this.cardHolder = cardHolder;
        this.fareCategory = fareCategory;
        this.amount = amount;
        this.previousBalance = previousBalance;
        this.newBalance = newBalance;
        this.paymentMethod = paymentMethod;
        this.status = status;
        this.unlockedDebt = unlockedDebt;
        this.notes = notes;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public String getReferenceCode() { return referenceCode; }
    public UUID getAgentUserId() { return agentUserId; }
    public String getType() { return type; }
    public String getCardId() { return cardId; }
    public String getCardHolder() { return cardHolder; }
    public String getFareCategory() { return fareCategory; }
    public BigDecimal getAmount() { return amount; }
    public BigDecimal getPreviousBalance() { return previousBalance; }
    public BigDecimal getNewBalance() { return newBalance; }
    public String getPaymentMethod() { return paymentMethod; }
    public String getStatus() { return status; }
    public boolean isUnlockedDebt() { return unlockedDebt; }
    public String getNotes() { return notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
