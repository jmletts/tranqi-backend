package com.tranki.backend.fleet.adapter.in.web.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record FleetDashboardResponseDTO(
        List<FleetBusDTO> buses,
        Map<String, FleetEarningsResponseDTO> earningsByPlate,
        BigDecimal totalFleetEarnings,
        List<FleetTripDTO> trips
) {}
