package com.tranki.backend.fleet.adapter.out.persistence;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "fleet_earnings")
public class FleetEarningsJpaEntity {
    @Id
    private UUID id;
    private String licensePlate;
    private BigDecimal totalEarnings;

    public FleetEarningsJpaEntity() {}

    public FleetEarningsJpaEntity(UUID id, String licensePlate, BigDecimal totalEarnings) {
        this.id = id;
        this.licensePlate = licensePlate;
        this.totalEarnings = totalEarnings;
    }

    public UUID getId() { return id; }
    public String getLicensePlate() { return licensePlate; }
    public BigDecimal getTotalEarnings() { return totalEarnings; }
}
