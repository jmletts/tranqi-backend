package com.tranki.backend.fleet.application;

import com.tranki.backend.fleet.domain.model.Bus;
import com.tranki.backend.fleet.domain.model.FleetEarnings;
import com.tranki.backend.fleet.domain.model.HardwareId;
import com.tranki.backend.fleet.domain.model.LicensePlate;
import com.tranki.backend.fleet.domain.model.PublicKey;
import com.tranki.backend.fleet.domain.repository.BusRepository;
import com.tranki.backend.fleet.domain.repository.FleetEarningsRepository;
import com.tranki.backend.shared.domain.Money;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
public class RegisterBusUseCase {

    private final BusRepository busRepository;
    private final FleetEarningsRepository earningsRepository;

    public RegisterBusUseCase(BusRepository busRepository, FleetEarningsRepository earningsRepository) {
        this.busRepository = busRepository;
        this.earningsRepository = earningsRepository;
    }

    @Transactional
    public Bus execute(String rawLicensePlate, String rawHardwareId, String rawPublicKey) {
        return execute(null, rawLicensePlate, rawHardwareId, rawPublicKey);
    }

    @Transactional
    public Bus execute(UUID ownerUserId, String rawLicensePlate, String rawHardwareId, String rawPublicKey) {
        String normalizedPlate = rawLicensePlate != null ? rawLicensePlate.trim().toUpperCase() : "";
        String normalizedHardware = rawHardwareId != null ? rawHardwareId.trim().toUpperCase() : "";
        String normalizedKey = rawPublicKey != null ? rawPublicKey.trim() : "";

        LicensePlate licensePlate = new LicensePlate(normalizedPlate);
        HardwareId hardwareId = new HardwareId(normalizedHardware);
        PublicKey publicKey = new PublicKey(normalizedKey);

        if (busRepository.existsByLicensePlate(licensePlate)) {
            throw new IllegalArgumentException("Ya existe una unidad registrada con la placa " + normalizedPlate + ".");
        }
        if (busRepository.existsByHardwareId(hardwareId)) {
            throw new IllegalArgumentException("El Hardware ID " + normalizedHardware + " ya está asignado a otra unidad.");
        }

        Bus bus = new Bus(UUID.randomUUID(), licensePlate, hardwareId, publicKey, ownerUserId);
        busRepository.save(bus);

        if (earningsRepository.findByLicensePlate(licensePlate).isEmpty()) {
            earningsRepository.save(new FleetEarnings(UUID.randomUUID(), licensePlate, Money.of("0.00")));
        }

        return bus;
    }
}
