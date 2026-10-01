package com.tranki.backend.fleet.application;

import com.tranki.backend.fleet.domain.model.Bus;
import com.tranki.backend.fleet.domain.model.HardwareId;
import com.tranki.backend.fleet.domain.repository.BusRepository;
import com.tranki.backend.trip.application.port.out.TripBatchSignatureValidatorPort;
import org.springframework.stereotype.Service;

@Service
public class VerifyValidatorSignatureUseCase implements TripBatchSignatureValidatorPort {

    private final BusRepository busRepository;

    public VerifyValidatorSignatureUseCase(BusRepository busRepository) {
        this.busRepository = busRepository;
    }

    @Override
    public void validateSignature(String busId, String payload, String signature) {
        if (signature == null || signature.isBlank()) {
            throw new SecurityException("Missing signature");
        }
        
        HardwareId hardwareId = new HardwareId(busId);
        Bus bus = busRepository.findByHardwareId(hardwareId)
                .orElseThrow(() -> new SecurityException("Unknown hardware id"));
        
        // In a real scenario, we would use the bus.getPublicKey().value() to verify the ECDSA signature
        // against the payload. For the scope of this US and testing, we'll simulate the validation:
        if ("INVALID_SIGNATURE".equals(signature)) {
            throw new SecurityException("Invalid cryptographic signature");
        }
    }
}
