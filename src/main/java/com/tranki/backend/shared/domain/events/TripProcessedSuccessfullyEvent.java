package com.tranki.backend.shared.domain.events;

import java.math.BigDecimal;

public record TripProcessedSuccessfullyEvent(String tripId, String cardId, String busId, BigDecimal fareAmount) {}
