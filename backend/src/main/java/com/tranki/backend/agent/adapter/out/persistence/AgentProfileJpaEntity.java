package com.tranki.backend.agent.adapter.out.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "agent_profiles")
public class AgentProfileJpaEntity {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "agent_code", unique = true, nullable = false, length = 32)
    private String agentCode;

    @Column(name = "business_name", nullable = false, length = 160)
    private String businessName;

    @Column(name = "business_address", nullable = false, length = 255)
    private String businessAddress;

    @Column(name = "operational_balance", nullable = false, precision = 12, scale = 2)
    private BigDecimal operationalBalance;

    @Column(name = "commission_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal commissionRate;

    @Column(name = "status", nullable = false, length = 32)
    private String status;

    @Column(name = "registered_at", nullable = false)
    private LocalDateTime registeredAt;

    public AgentProfileJpaEntity() {}

    public AgentProfileJpaEntity(
            UUID userId,
            String agentCode,
            String businessName,
            String businessAddress,
            BigDecimal operationalBalance,
            BigDecimal commissionRate,
            String status,
            LocalDateTime registeredAt) {
        this.userId = userId;
        this.agentCode = agentCode;
        this.businessName = businessName;
        this.businessAddress = businessAddress;
        this.operationalBalance = operationalBalance;
        this.commissionRate = commissionRate;
        this.status = status;
        this.registeredAt = registeredAt;
    }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getAgentCode() { return agentCode; }
    public void setAgentCode(String agentCode) { this.agentCode = agentCode; }
    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
    public String getBusinessAddress() { return businessAddress; }
    public void setBusinessAddress(String businessAddress) { this.businessAddress = businessAddress; }
    public BigDecimal getOperationalBalance() { return operationalBalance; }
    public void setOperationalBalance(BigDecimal operationalBalance) { this.operationalBalance = operationalBalance; }
    public BigDecimal getCommissionRate() { return commissionRate; }
    public void setCommissionRate(BigDecimal commissionRate) { this.commissionRate = commissionRate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(LocalDateTime registeredAt) { this.registeredAt = registeredAt; }
}
