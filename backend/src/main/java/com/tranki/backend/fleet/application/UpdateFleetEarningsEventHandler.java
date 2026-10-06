package com.tranki.backend.fleet.application;

import com.tranki.backend.fleet.domain.model.FleetEarnings;
import com.tranki.backend.fleet.domain.model.LicensePlate;
import com.tranki.backend.fleet.domain.repository.BusRepository;
import com.tranki.backend.fleet.domain.repository.FleetEarningsRepository;
import com.tranki.backend.shared.domain.Money;
import com.tranki.backend.shared.domain.events.TripProcessedSuccessfullyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Component
public class UpdateFleetEarningsEventHandler {

    private final BusRepository busRepository;
    private final FleetEarningsRepository earningsRepository;

    public UpdateFleetEarningsEventHandler(BusRepository busRepository, FleetEarningsRepository earningsRepository) {
        this.busRepository = busRepository;
        this.earningsRepository = earningsRepository;
    }

    @EventListener
    @Transactional
    public void on(TripProcessedSuccessfullyEvent event) {
        // We assume busId in the event is the hardwareId
        com.tranki.backend.fleet.domain.model.HardwareId hardwareId = new com.tranki.backend.fleet.domain.model.HardwareId(event.busId());
        
        busRepository.findByHardwareId(hardwareId).ifPresent(bus -> {
            FleetEarnings earnings = earningsRepository.findByLicensePlate(bus.getLicensePlate())
                .orElseGet(() -> new FleetEarnings(UUID.randomUUID(), bus.getLicensePlate(), Money.of("0.00")));
            
            earnings.addEarnings(new Money(event.fareAmount()));
            earningsRepository.save(earnings);
        });
    }
}
