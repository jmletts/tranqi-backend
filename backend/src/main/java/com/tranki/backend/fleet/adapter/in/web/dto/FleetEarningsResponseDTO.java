package com.tranki.backend.fleet.adapter.in.web.dto;

import java.math.BigDecimal;

public record FleetEarningsResponseDTO(String licensePlate, BigDecimal totalEarnings) {}
