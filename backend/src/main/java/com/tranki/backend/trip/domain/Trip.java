package com.tranki.backend.trip.domain;

import com.tranki.backend.shared.domain.Money;
import java.time.LocalDateTime;
import java.util.UUID;

public class Trip {
    private String tripId;
    private String cardId;
    private UUID accountId;
    private Money fare;
    private LocalDateTime localTimestamp;
    private String processingStatus;
    private boolean requiresDebtReview;
    private String busId;
    private String licensePlate;

    public Trip(String tripId, String cardId, UUID accountId, Money fare, LocalDateTime localTimestamp, String processingStatus, boolean requiresDebtReview) {
        this(tripId, cardId, accountId, fare, localTimestamp, processingStatus, requiresDebtReview, null, null);
    }

    public Trip(String tripId, String cardId, UUID accountId, Money fare, LocalDateTime localTimestamp, String processingStatus, boolean requiresDebtReview, String busId, String licensePlate) {
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
    public Money getFare() { return fare; }
    public LocalDateTime getLocalTimestamp() { return localTimestamp; }
    public String getProcessingStatus() { return processingStatus; }
    public boolean isRequiresDebtReview() { return requiresDebtReview; }
    public String getBusId() { return busId; }
    public String getLicensePlate() { return licensePlate; }
}
