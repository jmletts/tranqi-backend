package com.tranki.backend.fleet.adapter.in.web.dto;

public record TransporterRegisterRequestDTO(
        String name,
        String email,
        String phone,
        String licensePlate,
        String hardwareId,
        String publicKey
) {}
