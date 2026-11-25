package com.tranki.backend.trip.adapter.out.persistence;

import jakarta.persistence.Column;
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

    @Column(name = "bus_id")
    private String busId;

    @Column(name = "license_plate")
    private String licensePlate;

    public TripJpaEntity() {}

    public TripJpaEntity(String tripId, String cardId, UUID accountId, BigDecimal fare, LocalDateTime localTimestamp, String processingStatus, boolean requiresDebtReview) {
        this(tripId, cardId, accountId, fare, localTimestamp, processingStatus, requiresDebtReview, null, null);
    }

    public TripJpaEntity(String tripId, String cardId, UUID accountId, BigDecimal fare, LocalDateTime localTimestamp, String processingStatus, boolean requiresDebtReview, String busId, String licensePlate) {
        this.tripId = tripId;
        this.cardId = cardId;
        this.accountId = accountId;
        this.fare = fare;
        this.localTimestamp = localTimestamp;
        this.processingStatus = processingStatus;
        this.requiresDebtReview = requiresDebtReview;
        this.busId = busId;
        this.licensePlate = licensePlate;
    }

    public String getTripId() { return tripId; }
    public String getCardId() { return cardId; }
    public UUID getAccountId() { return accountId; }
    public BigDecimal getFare() { return fare; }
    public LocalDateTime getLocalTimestamp() { return localTimestamp; }
    public String getProcessingStatus() { return processingStatus; }
    public boolean isRequiresDebtReview() { return requiresDebtReview; }
    public String getBusId() { return busId; }
    public String getLicensePlate() { return licensePlate; }
}
