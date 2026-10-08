package com.tranki.backend.fleet.adapter.in.web;

import com.tranki.backend.fleet.adapter.in.web.dto.FleetEarningsResponseDTO;
import com.tranki.backend.fleet.adapter.in.web.dto.RegisterBusRequestDTO;
import com.tranki.backend.fleet.application.GetBusEarningsUseCase;
import com.tranki.backend.fleet.application.RegisterBusUseCase;
import com.tranki.backend.fleet.domain.model.FleetEarnings;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/fleet/buses")
public class FleetController {

    private final RegisterBusUseCase registerBusUseCase;
    private final GetBusEarningsUseCase getBusEarningsUseCase;

    public FleetController(RegisterBusUseCase registerBusUseCase, GetBusEarningsUseCase getBusEarningsUseCase) {
        this.registerBusUseCase = registerBusUseCase;
        this.getBusEarningsUseCase = getBusEarningsUseCase;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void registerBus(@RequestBody RegisterBusRequestDTO request) {
        registerBusUseCase.execute(request.licensePlate(), request.hardwareId(), request.publicKey());
    }

    @GetMapping("/{licensePlate}/earnings")
    public FleetEarningsResponseDTO getEarnings(@PathVariable String licensePlate) {
        FleetEarnings earnings = getBusEarningsUseCase.execute(licensePlate);
        return new FleetEarningsResponseDTO(
            earnings.getLicensePlate().value(),
            earnings.getTotalEarnings().amount()
        );
    }
}
