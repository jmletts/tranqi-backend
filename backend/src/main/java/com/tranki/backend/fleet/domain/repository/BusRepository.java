package com.tranki.backend.fleet.domain.repository;

import com.tranki.backend.fleet.domain.model.Bus;
import com.tranki.backend.fleet.domain.model.HardwareId;
import com.tranki.backend.fleet.domain.model.LicensePlate;
import java.util.Optional;
import java.util.UUID;

public interface BusRepository {
    void save(Bus bus);
    Optional<Bus> findById(UUID id);
    Optional<Bus> findByLicensePlate(LicensePlate licensePlate);
    Optional<Bus> findByHardwareId(HardwareId hardwareId);
    boolean existsByLicensePlate(LicensePlate licensePlate);
    boolean existsByHardwareId(HardwareId hardwareId);
}
