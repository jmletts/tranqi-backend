package com.tranki.backend.fleet.adapter.out.persistence;

import jakarta.persistence.Column;
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

    @Column(name = "owner_user_id")
    private UUID ownerUserId;

    public BusJpaEntity() {}

    public BusJpaEntity(UUID id, String licensePlate, String hardwareId, String publicKey) {
        this(id, licensePlate, hardwareId, publicKey, null);
    }

    public BusJpaEntity(UUID id, String licensePlate, String hardwareId, String publicKey, UUID ownerUserId) {
        this.id = id;
        this.licensePlate = licensePlate;
        this.hardwareId = hardwareId;
        this.publicKey = publicKey;
        this.ownerUserId = ownerUserId;
    }

    public UUID getId() { return id; }
    public String getLicensePlate() { return licensePlate; }
    public String getHardwareId() { return hardwareId; }
    public String getPublicKey() { return publicKey; }
    public UUID getOwnerUserId() { return ownerUserId; }
}
