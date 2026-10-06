package com.tranki.backend.fleet.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface FleetEarningsJpaRepository extends JpaRepository<FleetEarningsJpaEntity, UUID> {
    Optional<FleetEarningsJpaEntity> findByLicensePlate(String licensePlate);
}
