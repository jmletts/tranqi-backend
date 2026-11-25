package com.tranki.backend.fleet.adapter.in.web.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record FleetBusDTO(
        UUID id,
        String licensePlate,
        String hardwareId,
        String publicKey,
        BigDecimal totalEarnings,
        int processedTripsCount
) {}
