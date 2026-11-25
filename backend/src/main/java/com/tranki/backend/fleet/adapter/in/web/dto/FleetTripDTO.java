package com.tranki.backend.fleet.adapter.in.web.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FleetTripDTO(
        String tripId,
        String cardId,
        String busId,
        String licensePlate,
        BigDecimal fare,
        LocalDateTime localTimestamp,
        String processingStatus,
        boolean requiresDebtReview
) {}
