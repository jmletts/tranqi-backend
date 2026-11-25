package com.tranki.backend.fleet.adapter.in.web.dto;

import com.tranki.backend.iam.adapter.in.web.dto.UserProfileResponseDTO;

public record TransporterRegisterResponseDTO(
        String token,
        UserProfileResponseDTO user,
        FleetBusDTO bus
) {}
