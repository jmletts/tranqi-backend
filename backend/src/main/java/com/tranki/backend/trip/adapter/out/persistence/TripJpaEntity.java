package com.tranki.backend.trip.adapter.out.persistence;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "trips")
public class TripJpaEntity {
    @Id
    private String tripId;
    private String cardId;
    private UUID accountId;
    private BigDecimal fare;
    private LocalDateTime localTimestamp;
    private String processingStatus;
    private boolean requiresDebtReview;

    public TripJpaEntity() {}

    public TripJpaEntity(String tripId, String cardId, UUID accountId, BigDecimal fare, LocalDateTime localTimestamp, String processingStatus, boolean requiresDebtReview) {
        this.tripId = tripId;
        this.cardId = cardId;
        this.accountId = accountId;
        this.fare = fare;
        this.localTimestamp = localTimestamp;
        this.processingStatus = processingStatus;
        this.requiresDebtReview = requiresDebtReview;
    }

    public String getTripId() { return tripId; }
    public String getCardId() { return cardId; }
    public UUID getAccountId() { return accountId; }
    public BigDecimal getFare() { return fare; }
    public LocalDateTime getLocalTimestamp() { return localTimestamp; }
    public String getProcessingStatus() { return processingStatus; }
    public boolean isRequiresDebtReview() { return requiresDebtReview; }
}
