package com.tranki.backend.fleet.domain.repository;

import com.tranki.backend.fleet.domain.model.FleetEarnings;
import com.tranki.backend.fleet.domain.model.LicensePlate;
import java.util.Optional;
import java.util.UUID;

public interface FleetEarningsRepository {
    void save(FleetEarnings earnings);
    Optional<FleetEarnings> findById(UUID id);
    Optional<FleetEarnings> findByLicensePlate(LicensePlate licensePlate);
}
