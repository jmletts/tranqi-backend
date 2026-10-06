package com.tranki.backend.fleet.adapter.out.persistence;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "buses")
public class BusJpaEntity {
    @Id
    private UUID id;
    private String licensePlate;
    private String hardwareId;
    private String publicKey;

    public BusJpaEntity() {}

    public BusJpaEntity(UUID id, String licensePlate, String hardwareId, String publicKey) {
        this.id = id;
        this.licensePlate = licensePlate;
        this.hardwareId = hardwareId;
        this.publicKey = publicKey;
    }

    public UUID getId() { return id; }
    public String getLicensePlate() { return licensePlate; }
    public String getHardwareId() { return hardwareId; }
    public String getPublicKey() { return publicKey; }
}
