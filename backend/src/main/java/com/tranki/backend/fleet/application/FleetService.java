package com.tranki.backend.fleet.application;

import com.tranki.backend.account.adapter.out.persistence.AccountJpaEntity;
import com.tranki.backend.account.adapter.out.persistence.AccountJpaRepository;
import com.tranki.backend.account.domain.FareCategory;
import com.tranki.backend.card.adapter.out.persistence.CardJpaEntity;
import com.tranki.backend.card.adapter.out.persistence.CardJpaRepository;
import com.tranki.backend.card.domain.CardStatus;
import com.tranki.backend.fleet.adapter.in.web.dto.*;
import com.tranki.backend.fleet.adapter.out.persistence.BusJpaEntity;
import com.tranki.backend.fleet.adapter.out.persistence.BusJpaRepository;
import com.tranki.backend.fleet.domain.model.Bus;
import com.tranki.backend.fleet.domain.model.FleetEarnings;
import com.tranki.backend.fleet.domain.repository.BusRepository;
import com.tranki.backend.fleet.domain.repository.FleetEarningsRepository;
import com.tranki.backend.iam.adapter.in.web.dto.UserProfileResponseDTO;
import com.tranki.backend.iam.domain.Email;
import com.tranki.backend.iam.domain.Role;
import com.tranki.backend.iam.domain.User;
import com.tranki.backend.iam.domain.UserRepository;
import com.tranki.backend.iam.infrastructure.security.JwtTokenProvider;
import com.tranki.backend.trip.adapter.in.web.dto.TripBatchRequestDTO;
import com.tranki.backend.trip.adapter.in.web.dto.TripBatchResponseDTO;
import com.tranki.backend.trip.adapter.in.web.dto.TripRequestDTO;
import com.tranki.backend.trip.adapter.out.persistence.TripJpaEntity;
import com.tranki.backend.trip.adapter.out.persistence.TripJpaRepository;
import com.tranki.backend.trip.application.ProcessTripBatchUseCase;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class FleetService {

    private final BusRepository busRepository;
    private final BusJpaRepository busJpaRepository;
    private final FleetEarningsRepository earningsRepository;
    private final TripJpaRepository tripJpaRepository;
    private final CardJpaRepository cardJpaRepository;
    private final AccountJpaRepository accountJpaRepository;
    private final UserRepository userRepository;
    private final RegisterBusUseCase registerBusUseCase;
    private final GetBusEarningsUseCase getBusEarningsUseCase;
    private final ProcessTripBatchUseCase processTripBatchUseCase;
    private final JwtTokenProvider jwtTokenProvider;
    private final SecureRandom secureRandom = new SecureRandom();

    public FleetService(
            BusRepository busRepository,
            BusJpaRepository busJpaRepository,
            FleetEarningsRepository earningsRepository,
            TripJpaRepository tripJpaRepository,
            CardJpaRepository cardJpaRepository,
            AccountJpaRepository accountJpaRepository,
            UserRepository userRepository,
            RegisterBusUseCase registerBusUseCase,
            GetBusEarningsUseCase getBusEarningsUseCase,
            ProcessTripBatchUseCase processTripBatchUseCase,
            JwtTokenProvider jwtTokenProvider) {
        this.busRepository = busRepository;
        this.busJpaRepository = busJpaRepository;
        this.earningsRepository = earningsRepository;
        this.tripJpaRepository = tripJpaRepository;
        this.cardJpaRepository = cardJpaRepository;
        this.accountJpaRepository = accountJpaRepository;
        this.userRepository = userRepository;
        this.registerBusUseCase = registerBusUseCase;
        this.getBusEarningsUseCase = getBusEarningsUseCase;
        this.processTripBatchUseCase = processTripBatchUseCase;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public TransporterRegisterResponseDTO registerTransporter(User currentUser, TransporterRegisterRequestDTO request) {
        if (request.licensePlate() == null || request.licensePlate().isBlank()) {
            throw new IllegalArgumentException("La placa de la unidad es obligatoria.");
        }
        if (request.hardwareId() == null || request.hardwareId().isBlank()) {
            throw new IllegalArgumentException("El Hardware ID (MAC del ESP32) es obligatorio.");
        }
        if (request.publicKey() == null || request.publicKey().isBlank()) {
            throw new IllegalArgumentException("La clave pública ECDSA es obligatoria.");
        }

        Email nextEmail = (request.email() != null && !request.email().isBlank())
                ? new Email(request.email().trim())
                : null;
        currentUser.updateProfile(request.name(), request.phone(), nextEmail, null);
        currentUser.addRole(Role.GESTOR_FLOTA);
        userRepository.save(currentUser);

        Bus bus = registerBusUseCase.execute(
                currentUser.getId(),
                request.licensePlate(),
                request.hardwareId(),
                request.publicKey()
        );

        var authorities = currentUser.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .toList();
        var auth = new UsernamePasswordAuthenticationToken(currentUser.getDni().getValue(), null, authorities);
        String newToken = jwtTokenProvider.generateToken(auth, currentUser.getId());

        FleetBusDTO busDto = new FleetBusDTO(
                bus.getId(),
                bus.getLicensePlate().value(),
                bus.getHardwareId().value(),
                bus.getPublicKey().value(),
                BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                0
        );

        return new TransporterRegisterResponseDTO(
                newToken,
                toUserProfileDto(currentUser),
                busDto
        );
    }

    @Transactional(readOnly = true)
    public FleetDashboardResponseDTO getDashboard(User owner) {
        List<Bus> buses = busRepository.findByOwnerUserId(owner.getId());

        Map<String, String> plateByHardwareId = new HashMap<>();
        List<String> hardwareIds = new ArrayList<>();
        for (Bus bus : buses) {
            hardwareIds.add(bus.getHardwareId().value());
            plateByHardwareId.put(bus.getHardwareId().value(), bus.getLicensePlate().value());
        }

        List<TripJpaEntity> tripEntities = hardwareIds.isEmpty()
                ? List.of()
                : tripJpaRepository.findByBusIdInOrderByLocalTimestampDesc(hardwareIds);

        Map<String, Integer> tripCountByHardwareId = new HashMap<>();
        List<FleetTripDTO> tripDtos = new ArrayList<>();
        for (TripJpaEntity t : tripEntities) {
            if (t.getBusId() != null) {
                tripCountByHardwareId.merge(t.getBusId(), 1, Integer::sum);
            }
            String resolvedPlate = (t.getLicensePlate() != null && !t.getLicensePlate().isBlank())
                    ? t.getLicensePlate()
                    : plateByHardwareId.getOrDefault(t.getBusId(), "");
            tripDtos.add(new FleetTripDTO(
                    t.getTripId(),
                    t.getCardId(),
                    t.getBusId(),
                    resolvedPlate,
                    t.getFare().setScale(2, RoundingMode.HALF_UP),
                    t.getLocalTimestamp(),
                    normalizeStatus(t.getProcessingStatus()),
                    t.isRequiresDebtReview()
            ));
        }

        Map<String, FleetEarningsResponseDTO> earningsByPlate = new LinkedHashMap<>();
        List<FleetBusDTO> busDtos = new ArrayList<>();
        BigDecimal totalFleetEarnings = BigDecimal.ZERO;

        for (Bus bus : buses) {
            String plate = bus.getLicensePlate().value();
            BigDecimal busEarnings = earningsRepository.findByLicensePlate(bus.getLicensePlate())
                    .map(e -> e.getTotalEarnings().amount().setScale(2, RoundingMode.HALF_UP))
                    .orElse(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));

            earningsByPlate.put(plate, new FleetEarningsResponseDTO(plate, busEarnings));
            totalFleetEarnings = totalFleetEarnings.add(busEarnings);

            int tripsCount = tripCountByHardwareId.getOrDefault(bus.getHardwareId().value(), 0);
            busDtos.add(new FleetBusDTO(
                    bus.getId(),
                    plate,
                    bus.getHardwareId().value(),
                    bus.getPublicKey().value(),
                    busEarnings,
                    tripsCount
            ));
        }

        return new FleetDashboardResponseDTO(
                busDtos,
                earningsByPlate,
                totalFleetEarnings.setScale(2, RoundingMode.HALF_UP),
                tripDtos
        );
    }

    @Transactional(readOnly = true)
    public List<FleetBusDTO> getBusesForOwner(User owner) {
        return getDashboard(owner).buses();
    }

    @Transactional
    public FleetBusDTO registerBusForOwner(User owner, RegisterBusRequestDTO request) {
        Bus bus = registerBusUseCase.execute(
                owner.getId(),
                request.licensePlate(),
                request.hardwareId(),
                request.publicKey()
        );
        return new FleetBusDTO(
                bus.getId(),
                bus.getLicensePlate().value(),
                bus.getHardwareId().value(),
                bus.getPublicKey().value(),
                BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                0
        );
    }

    @Transactional(readOnly = true)
    public FleetEarningsResponseDTO getEarningsForOwner(User owner, String rawLicensePlate) {
        String normalizedPlate = rawLicensePlate != null ? rawLicensePlate.trim().toUpperCase() : "";
        BusJpaEntity busEntity = busJpaRepository.findByLicensePlateIgnoreCase(normalizedPlate)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró ninguna unidad registrada con la placa " + normalizedPlate + "."));

        if (busEntity.getOwnerUserId() != null && !busEntity.getOwnerUserId().equals(owner.getId())) {
            throw new SecurityException("No tienes permiso para consultar la recaudación de la unidad " + normalizedPlate + ".");
        }

        FleetEarnings earnings = getBusEarningsUseCase.execute(normalizedPlate);
        return new FleetEarningsResponseDTO(
                earnings.getLicensePlate().value(),
                earnings.getTotalEarnings().amount().setScale(2, RoundingMode.HALF_UP)
        );
    }

    @Transactional(readOnly = true)
    public List<FleetTripDTO> getTripsForOwner(User owner, String licensePlateFilter) {
        if (licensePlateFilter != null && !licensePlateFilter.isBlank()) {
            String normalizedPlate = licensePlateFilter.trim().toUpperCase();
            BusJpaEntity busEntity = busJpaRepository.findByLicensePlateIgnoreCase(normalizedPlate)
                    .orElseThrow(() -> new IllegalArgumentException("No se encontró ninguna unidad registrada con la placa " + normalizedPlate + "."));
            if (busEntity.getOwnerUserId() != null && !busEntity.getOwnerUserId().equals(owner.getId())) {
                throw new SecurityException("No tienes permiso para ver los viajes de la unidad " + normalizedPlate + ".");
            }
            return tripJpaRepository.findByBusIdInOrderByLocalTimestampDesc(List.of(busEntity.getHardwareId()))
                    .stream()
                    .map(t -> new FleetTripDTO(
                            t.getTripId(),
                            t.getCardId(),
                            t.getBusId(),
                            busEntity.getLicensePlate(),
                            t.getFare().setScale(2, RoundingMode.HALF_UP),
                            t.getLocalTimestamp(),
                            normalizeStatus(t.getProcessingStatus()),
                            t.isRequiresDebtReview()
                    ))
                    .toList();
        }
        return getDashboard(owner).trips();
    }

    @Transactional
    public FleetSyncBatchResponseDTO syncSimulatedBatchForBus(User owner, String rawLicensePlate) {
        String normalizedPlate = rawLicensePlate != null ? rawLicensePlate.trim().toUpperCase() : "";
        BusJpaEntity busEntity = busJpaRepository.findByLicensePlateIgnoreCase(normalizedPlate)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró ninguna unidad registrada con la placa " + normalizedPlate + "."));

        if (busEntity.getOwnerUserId() != null && !busEntity.getOwnerUserId().equals(owner.getId())) {
            throw new SecurityException("No tienes permiso para sincronizar lotes en la unidad " + normalizedPlate + ".");
        }

        // Select up to 2 real ACTIVE passenger cards with linked accounts in PostgreSQL
        List<CardJpaEntity> activeCards = cardJpaRepository.findByCardStatusOrderByCardIdAsc(CardStatus.ACTIVE);
        List<TripRequestDTO> tripRequests = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        long epochSec = System.currentTimeMillis() / 1000L;

        for (CardJpaEntity card : activeCards) {
            if (card.getAccountId() == null) {
                continue;
            }
            AccountJpaEntity account = accountJpaRepository.findById(card.getAccountId()).orElse(null);
            if (account == null || account.getBalance() == null || account.getBalance().compareTo(new BigDecimal("1.50")) < 0) {
                continue;
            }

            BigDecimal fare = (account.getFareCategory() == FareCategory.UNIVERSITY
                    || account.getFareCategory() == FareCategory.SCHOOL)
                    ? new BigDecimal("0.60")
                    : new BigDecimal("1.20");

            int idx = tripRequests.size() + 1;
            String tripId = String.format("VIA-%d-%04d-%d", epochSec % 1000000L, secureRandom.nextInt(10000), idx);
            tripRequests.add(new TripRequestDTO(
                    tripId,
                    card.getCardId(),
                    fare,
                    now.minusSeconds(20L * idx)
            ));

            if (tripRequests.size() >= 2) {
                break;
            }
        }

        if (tripRequests.isEmpty()) {
            throw new IllegalArgumentException("No hay tarjetas activas con saldo suficiente en PostgreSQL para procesar un lote de viajes.");
        }

        TripBatchRequestDTO batchRequest = new TripBatchRequestDTO(
                busEntity.getHardwareId(),
                "ESP32-" + busEntity.getLicensePlate(),
                tripRequests
        );
        TripBatchResponseDTO batchResult = processTripBatchUseCase.execute(batchRequest);

        return new FleetSyncBatchResponseDTO(batchResult, getDashboard(owner));
    }

    private String normalizeStatus(String status) {
        if ("PROCESADO".equalsIgnoreCase(status)) {
            return "PROCESSED";
        }
        return status != null ? status : "PROCESSED";
    }

    private UserProfileResponseDTO toUserProfileDto(User user) {
        return new UserProfileResponseDTO(
                user.getId(),
                user.getDni().getValue(),
                user.getName(),
                user.getPhone(),
                user.getEmail().getValue(),
                user.getAge(),
                user.getAddress(),
                user.getBaseFare() != null ? user.getBaseFare().name() : "GENERAL",
                user.getRoles().stream().map(Role::name).toList()
        );
    }
}
