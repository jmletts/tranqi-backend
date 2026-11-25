package com.tranki.backend.fleet.adapter.in.web;

import com.tranki.backend.fleet.adapter.in.web.dto.*;
import com.tranki.backend.fleet.application.FleetService;
import com.tranki.backend.iam.domain.User;
import com.tranki.backend.iam.infrastructure.security.AuthenticatedUserResolver;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fleet")
public class FleetController {

    private final FleetService fleetService;
    private final AuthenticatedUserResolver authenticatedUserResolver;

    public FleetController(FleetService fleetService, AuthenticatedUserResolver authenticatedUserResolver) {
        this.fleetService = fleetService;
        this.authenticatedUserResolver = authenticatedUserResolver;
    }

    @PostMapping("/register")
    public ResponseEntity<TransporterRegisterResponseDTO> registerTransporter(
            @RequestBody TransporterRegisterRequestDTO request) {
        User currentUser = authenticatedUserResolver.requireAuthenticatedUser();
        return ResponseEntity.ok(fleetService.registerTransporter(currentUser, request));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('GESTOR_FLOTA')")
    public ResponseEntity<FleetDashboardResponseDTO> getDashboard() {
        User currentUser = authenticatedUserResolver.requireAuthenticatedUser();
        return ResponseEntity.ok(fleetService.getDashboard(currentUser));
    }

    @GetMapping("/buses")
    @PreAuthorize("hasRole('GESTOR_FLOTA')")
    public ResponseEntity<List<FleetBusDTO>> listBuses() {
        User currentUser = authenticatedUserResolver.requireAuthenticatedUser();
        return ResponseEntity.ok(fleetService.getBusesForOwner(currentUser));
    }

    @PostMapping("/buses")
    @PreAuthorize("hasRole('GESTOR_FLOTA')")
    @ResponseStatus(HttpStatus.CREATED)
    public FleetBusDTO registerBus(@RequestBody RegisterBusRequestDTO request) {
        User currentUser = authenticatedUserResolver.requireAuthenticatedUser();
        return fleetService.registerBusForOwner(currentUser, request);
    }

    @GetMapping("/buses/{licensePlate}/earnings")
    @PreAuthorize("hasRole('GESTOR_FLOTA')")
    public FleetEarningsResponseDTO getEarnings(@PathVariable String licensePlate) {
        User currentUser = authenticatedUserResolver.requireAuthenticatedUser();
        return fleetService.getEarningsForOwner(currentUser, licensePlate);
    }

    @GetMapping("/trips")
    @PreAuthorize("hasRole('GESTOR_FLOTA')")
    public ResponseEntity<List<FleetTripDTO>> listTrips(
            @RequestParam(name = "licensePlate", required = false) String licensePlate) {
        User currentUser = authenticatedUserResolver.requireAuthenticatedUser();
        return ResponseEntity.ok(fleetService.getTripsForOwner(currentUser, licensePlate));
    }

    @PostMapping("/buses/{licensePlate}/sync-batch")
    @PreAuthorize("hasRole('GESTOR_FLOTA')")
    public ResponseEntity<FleetSyncBatchResponseDTO> syncSimulatedBatch(@PathVariable String licensePlate) {
        User currentUser = authenticatedUserResolver.requireAuthenticatedUser();
        return ResponseEntity.ok(fleetService.syncSimulatedBatchForBus(currentUser, licensePlate));
    }
}
