package com.tranki.backend.agent.adapter.out.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "agent_cash_closures")
public class AgentCashClosureJpaEntity {

    @Id
    private UUID id;

    @Column(name = "agent_user_id", nullable = false)
    private UUID agentUserId;

    @Column(name = "closed_at", nullable = false)
    private LocalDateTime closedAt;

    @Column(name = "total_recharged", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalRecharged;

    @Column(name = "cash_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal cashTotal;

    @Column(name = "digital_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal digitalTotal;

    @Column(name = "card_issues_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal cardIssuesTotal;

    @Column(name = "transactions_count", nullable = false)
    private int transactionsCount;

    @Column(name = "estimated_commission", nullable = false, precision = 12, scale = 2)
    private BigDecimal estimatedCommission;

    @Column(name = "operational_balance_snapshot", nullable = false, precision = 12, scale = 2)
    private BigDecimal operationalBalanceSnapshot;

    @Column(name = "notes", length = 300)
    private String notes;

    public AgentCashClosureJpaEntity() {}

    public AgentCashClosureJpaEntity(
            UUID id,
            UUID agentUserId,
            LocalDateTime closedAt,
            BigDecimal totalRecharged,
            BigDecimal cashTotal,
            BigDecimal digitalTotal,
            BigDecimal cardIssuesTotal,
            int transactionsCount,
            BigDecimal estimatedCommission,
            BigDecimal operationalBalanceSnapshot,
            String notes) {
        this.id = id;
        this.agentUserId = agentUserId;
        this.closedAt = closedAt;
        this.totalRecharged = totalRecharged;
        this.cashTotal = cashTotal;
        this.digitalTotal = digitalTotal;
        this.cardIssuesTotal = cardIssuesTotal;
        this.transactionsCount = transactionsCount;
        this.estimatedCommission = estimatedCommission;
        this.operationalBalanceSnapshot = operationalBalanceSnapshot;
        this.notes = notes;
    }

    public UUID getId() { return id; }
    public UUID getAgentUserId() { return agentUserId; }
    public LocalDateTime getClosedAt() { return closedAt; }
    public BigDecimal getTotalRecharged() { return totalRecharged; }
    public BigDecimal getCashTotal() { return cashTotal; }
    public BigDecimal getDigitalTotal() { return digitalTotal; }
    public BigDecimal getCardIssuesTotal() { return cardIssuesTotal; }
    public int getTransactionsCount() { return transactionsCount; }
    public BigDecimal getEstimatedCommission() { return estimatedCommission; }
    public BigDecimal getOperationalBalanceSnapshot() { return operationalBalanceSnapshot; }
    public String getNotes() { return notes; }
}
