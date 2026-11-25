package com.tranki.backend.fleet.adapter.in.web.dto;

import com.tranki.backend.trip.adapter.in.web.dto.TripBatchResponseDTO;

public record FleetSyncBatchResponseDTO(
        TripBatchResponseDTO batchResult,
        FleetDashboardResponseDTO dashboard
) {}
