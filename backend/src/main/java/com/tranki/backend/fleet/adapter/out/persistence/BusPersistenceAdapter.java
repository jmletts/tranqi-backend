package com.tranki.backend.fleet.adapter.out.persistence;

import com.tranki.backend.fleet.domain.model.Bus;
import com.tranki.backend.fleet.domain.model.HardwareId;
import com.tranki.backend.fleet.domain.model.LicensePlate;
import com.tranki.backend.fleet.domain.model.PublicKey;
import com.tranki.backend.fleet.domain.repository.BusRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public class BusPersistenceAdapter implements BusRepository {

    private final BusJpaRepository jpaRepository;

    public BusPersistenceAdapter(BusJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public void save(Bus bus) {
        jpaRepository.save(new BusJpaEntity(
            bus.getId(),
            bus.getLicensePlate().value(),
            bus.getHardwareId().value(),
            bus.getPublicKey().value()
        ));
    }

    @Override
    public Optional<Bus> findById(UUID id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<Bus> findByLicensePlate(LicensePlate licensePlate) {
        return jpaRepository.findByLicensePlate(licensePlate.value()).map(this::toDomain);
    }

    @Override
    public Optional<Bus> findByHardwareId(HardwareId hardwareId) {
        return jpaRepository.findByHardwareId(hardwareId.value()).map(this::toDomain);
    }

    @Override
    public boolean existsByLicensePlate(LicensePlate licensePlate) {
        return jpaRepository.existsByLicensePlate(licensePlate.value());
    }

    @Override
    public boolean existsByHardwareId(HardwareId hardwareId) {
        return jpaRepository.existsByHardwareId(hardwareId.value());
    }

    private Bus toDomain(BusJpaEntity entity) {
        return new Bus(
            entity.getId(),
            new LicensePlate(entity.getLicensePlate()),
            new HardwareId(entity.getHardwareId()),
            new PublicKey(entity.getPublicKey())
        );
    }
}
