package com.tranki.backend.shared.domain.events;

public record TripGeneratedExcessDebtRequiresReviewEvent(String tripId, String cardId) {}
