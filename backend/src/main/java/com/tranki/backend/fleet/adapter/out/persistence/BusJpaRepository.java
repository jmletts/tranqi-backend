package com.tranki.backend.fleet.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BusJpaRepository extends JpaRepository<BusJpaEntity, UUID> {
    Optional<BusJpaEntity> findByLicensePlate(String licensePlate);
    Optional<BusJpaEntity> findByLicensePlateIgnoreCase(String licensePlate);
    Optional<BusJpaEntity> findByHardwareId(String hardwareId);
    List<BusJpaEntity> findByOwnerUserId(UUID ownerUserId);
    boolean existsByLicensePlate(String licensePlate);
    boolean existsByHardwareId(String hardwareId);
}
