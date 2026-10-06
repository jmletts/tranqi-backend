package com.tranki.backend.fleet.domain.model;

public record HardwareId(String value) {
    public HardwareId {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("HardwareId cannot be empty");
        }
    }
}
