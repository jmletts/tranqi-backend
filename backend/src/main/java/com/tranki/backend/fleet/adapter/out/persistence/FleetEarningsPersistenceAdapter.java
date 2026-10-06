package com.tranki.backend.fleet.adapter.out.persistence;

import com.tranki.backend.fleet.domain.model.FleetEarnings;
import com.tranki.backend.fleet.domain.model.LicensePlate;
import com.tranki.backend.fleet.domain.repository.FleetEarningsRepository;
import com.tranki.backend.shared.domain.Money;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public class FleetEarningsPersistenceAdapter implements FleetEarningsRepository {

    private final FleetEarningsJpaRepository jpaRepository;

    public FleetEarningsPersistenceAdapter(FleetEarningsJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public void save(FleetEarnings earnings) {
        jpaRepository.save(new FleetEarningsJpaEntity(
            earnings.getId(),
            earnings.getLicensePlate().value(),
            earnings.getTotalEarnings().amount()
        ));
    }

    @Override
    public Optional<FleetEarnings> findById(UUID id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<FleetEarnings> findByLicensePlate(LicensePlate licensePlate) {
        return jpaRepository.findByLicensePlate(licensePlate.value()).map(this::toDomain);
    }

    private FleetEarnings toDomain(FleetEarningsJpaEntity entity) {
        return new FleetEarnings(
            entity.getId(),
            new LicensePlate(entity.getLicensePlate()),
            new Money(entity.getTotalEarnings())
        );
    }
}
