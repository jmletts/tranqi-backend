package com.tranki.backend.trip.adapter.in.web.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TripRequestDTO(String tripId, String cardId, BigDecimal fare, LocalDateTime localTimestamp) {}
