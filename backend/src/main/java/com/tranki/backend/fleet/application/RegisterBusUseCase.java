package com.tranki.backend.fleet.application;

import com.tranki.backend.fleet.domain.model.Bus;
import com.tranki.backend.fleet.domain.model.HardwareId;
import com.tranki.backend.fleet.domain.model.LicensePlate;
import com.tranki.backend.fleet.domain.model.PublicKey;
import com.tranki.backend.fleet.domain.repository.BusRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
public class RegisterBusUseCase {

    private final BusRepository busRepository;

    public RegisterBusUseCase(BusRepository busRepository) {
        this.busRepository = busRepository;
    }

    @Transactional
    public Bus execute(String rawLicensePlate, String rawHardwareId, String rawPublicKey) {
        LicensePlate licensePlate = new LicensePlate(rawLicensePlate);
        HardwareId hardwareId = new HardwareId(rawHardwareId);
        PublicKey publicKey = new PublicKey(rawPublicKey);

        if (busRepository.existsByLicensePlate(licensePlate)) {
            throw new IllegalArgumentException("License plate already exists");
        }
        if (busRepository.existsByHardwareId(hardwareId)) {
            throw new IllegalArgumentException("Hardware ID already assigned to another bus");
        }

        Bus bus = new Bus(UUID.randomUUID(), licensePlate, hardwareId, publicKey);
        busRepository.save(bus);
        return bus;
    }
}
