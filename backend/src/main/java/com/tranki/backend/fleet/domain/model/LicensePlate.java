package com.tranki.backend.fleet.domain.model;

public record LicensePlate(String value) {
    public LicensePlate {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("LicensePlate cannot be empty");
        }
    }
}
