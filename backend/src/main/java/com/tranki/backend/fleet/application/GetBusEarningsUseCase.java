package com.tranki.backend.fleet.application;

import com.tranki.backend.fleet.domain.model.FleetEarnings;
import com.tranki.backend.fleet.domain.model.LicensePlate;
import com.tranki.backend.fleet.domain.repository.BusRepository;
import com.tranki.backend.fleet.domain.repository.FleetEarningsRepository;
import com.tranki.backend.shared.domain.Money;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class GetBusEarningsUseCase {

    private final FleetEarningsRepository earningsRepository;
    private final BusRepository busRepository;

    public GetBusEarningsUseCase(FleetEarningsRepository earningsRepository, BusRepository busRepository) {
        this.earningsRepository = earningsRepository;
        this.busRepository = busRepository;
    }

    public FleetEarnings execute(String rawLicensePlate) {
        String normalized = rawLicensePlate != null ? rawLicensePlate.trim().toUpperCase() : "";
        LicensePlate licensePlate = new LicensePlate(normalized);
        return earningsRepository.findByLicensePlate(licensePlate)
                .orElseGet(() -> {
                    if (busRepository.existsByLicensePlate(licensePlate)) {
                        return new FleetEarnings(UUID.randomUUID(), licensePlate, Money.of("0.00"));
                    }
                    throw new IllegalArgumentException("No se encontró ninguna unidad registrada con la placa " + normalized + ".");
                });
    }
}
