package com.tranki.backend.fleet.domain.model;

import com.tranki.backend.shared.domain.Money;
import java.util.UUID;

public class FleetEarnings {
    private final UUID id;
    private final LicensePlate licensePlate;
    private Money totalEarnings;

    public FleetEarnings(UUID id, LicensePlate licensePlate, Money totalEarnings) {
        if (id == null || licensePlate == null || totalEarnings == null) {
            throw new IllegalArgumentException("FleetEarnings attributes cannot be null");
        }
        this.id = id;
        this.licensePlate = licensePlate;
        this.totalEarnings = totalEarnings;
    }

    public void addEarnings(Money amount) {
        this.totalEarnings = this.totalEarnings.add(amount);
    }

    public UUID getId() {
        return id;
    }

    public LicensePlate getLicensePlate() {
        return licensePlate;
    }

    public Money getTotalEarnings() {
        return totalEarnings;
    }
}
