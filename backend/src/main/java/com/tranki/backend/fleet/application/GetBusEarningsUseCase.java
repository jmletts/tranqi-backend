package com.tranki.backend.fleet.application;

import com.tranki.backend.fleet.domain.model.FleetEarnings;
import com.tranki.backend.fleet.domain.model.LicensePlate;
import com.tranki.backend.fleet.domain.repository.FleetEarningsRepository;
import org.springframework.stereotype.Service;

@Service
public class GetBusEarningsUseCase {

    private final FleetEarningsRepository earningsRepository;

    public GetBusEarningsUseCase(FleetEarningsRepository earningsRepository) {
        this.earningsRepository = earningsRepository;
    }

    public FleetEarnings execute(String rawLicensePlate) {
        LicensePlate licensePlate = new LicensePlate(rawLicensePlate);
        return earningsRepository.findByLicensePlate(licensePlate)
                .orElseThrow(() -> new IllegalArgumentException("Earnings not found for bus"));
    }
}
