package com.tranki.backend.iam.domain;

public class PasswordHash {
    private final String value;

    public PasswordHash(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Password hash cannot be empty");
        }
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
