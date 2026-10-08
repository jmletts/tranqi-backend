package com.tranki.backend.fleet.domain.model;

public record PublicKey(String value) {
    public PublicKey {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("PublicKey cannot be empty");
        }
    }
}
