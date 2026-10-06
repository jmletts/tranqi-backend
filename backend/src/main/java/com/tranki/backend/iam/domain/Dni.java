package com.tranki.backend.iam.domain;

public class Dni {
    private final String value;

    public Dni(String value) {
        if (value == null || !value.matches("\\d{8,10}")) {
            throw new IllegalArgumentException("DNI must be between 8 and 10 digits");
        }
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Dni dni = (Dni) o;
        return value.equals(dni.value);
    }

    @Override
    public int hashCode() {
        return value.hashCode();
    }
}
