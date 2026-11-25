package com.tranki.backend.fleet.domain.model;

import java.util.UUID;

public class Bus {
    private final UUID id;
    private final LicensePlate licensePlate;
    private final HardwareId hardwareId;
    private final PublicKey publicKey;
    private final UUID ownerUserId;

    public Bus(UUID id, LicensePlate licensePlate, HardwareId hardwareId, PublicKey publicKey) {
        this(id, licensePlate, hardwareId, publicKey, null);
    }

    public Bus(UUID id, LicensePlate licensePlate, HardwareId hardwareId, PublicKey publicKey, UUID ownerUserId) {
        if (id == null || licensePlate == null || hardwareId == null || publicKey == null) {
            throw new IllegalArgumentException("Bus attributes cannot be null");
        }
        this.id = id;
        this.licensePlate = licensePlate;
        this.hardwareId = hardwareId;
        this.publicKey = publicKey;
        this.ownerUserId = ownerUserId;
    }

    public UUID getId() { return id; }
    public LicensePlate getLicensePlate() { return licensePlate; }
    public HardwareId getHardwareId() { return hardwareId; }
    public PublicKey getPublicKey() { return publicKey; }
    public UUID getOwnerUserId() { return ownerUserId; }
}
