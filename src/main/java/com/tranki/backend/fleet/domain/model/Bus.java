package com.tranki.backend.fleet.domain.model;

import java.util.UUID;

public class Bus {
    private final UUID id;
    private final LicensePlate licensePlate;
    private final HardwareId hardwareId;
    private final PublicKey publicKey;

    public Bus(UUID id, LicensePlate licensePlate, HardwareId hardwareId, PublicKey publicKey) {
        if (id == null || licensePlate == null || hardwareId == null || publicKey == null) {
            throw new IllegalArgumentException("Bus attributes cannot be null");
        }
        this.id = id;
        this.licensePlate = licensePlate;
        this.hardwareId = hardwareId;
        this.publicKey = publicKey;
    }

    public UUID getId() {
        return id;
    }

    public LicensePlate getLicensePlate() {
        return licensePlate;
    }

    public HardwareId getHardwareId() {
        return hardwareId;
    }

    public PublicKey getPublicKey() {
        return publicKey;
    }
}
