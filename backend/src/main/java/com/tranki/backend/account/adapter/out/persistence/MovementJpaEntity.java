package com.tranki.backend.account.adapter.out.persistence;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "account_movements_view")
public class MovementJpaEntity {
    @Id
    private String identifier;
    private UUID accountId;
    private String type;
    private BigDecimal amount;
    private LocalDateTime movementDate;
    private String detail;

    public MovementJpaEntity() {}

    public MovementJpaEntity(String identifier, UUID accountId, String type, BigDecimal amount, LocalDateTime movementDate, String detail) {
        this.identifier = identifier;
        this.accountId = accountId;
        this.type = type;
        this.amount = amount;
        this.movementDate = movementDate;
        this.detail = detail;
    }

    public String getIdentifier() { return identifier; }
    public UUID getAccountId() { return accountId; }
    public String getType() { return type; }
    public BigDecimal getAmount() { return amount; }
    public LocalDateTime getMovementDate() { return movementDate; }
    public String getDetail() { return detail; }
}
