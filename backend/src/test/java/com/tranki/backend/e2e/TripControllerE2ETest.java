package com.tranki.backend.e2e;

import com.tranki.backend.account.adapter.out.persistence.AccountJpaEntity;
import com.tranki.backend.account.domain.AccountStatus;
import com.tranki.backend.account.domain.FareCategory;
import com.tranki.backend.card.adapter.out.persistence.CardJpaEntity;
import com.tranki.backend.card.domain.CardStatus;
import com.tranki.backend.fleet.adapter.out.persistence.BusJpaEntity;
import com.tranki.backend.fleet.adapter.out.persistence.BusJpaRepository;
import com.tranki.backend.trip.adapter.in.web.dto.TripBatchRequestDTO;
import com.tranki.backend.trip.adapter.in.web.dto.TripBatchResponseDTO;
import com.tranki.backend.trip.adapter.in.web.dto.TripRequestDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

public class TripControllerE2ETest extends BaseE2ETest {

    @Autowired
    private BusJpaRepository busJpaRepository;

    @BeforeEach
    public void setupBus() {
        if (!busJpaRepository.existsByHardwareId("BUS-201")) {
            busJpaRepository.save(new BusJpaEntity(UUID.randomUUID(), "PLATE-201", "BUS-201", "PUB-KEY"));
        }
    }

    @Test
    public void shouldProcessValidTripBatchSuccessfully() {
        UUID accountId = UUID.randomUUID();
        AccountJpaEntity account = new AccountJpaEntity();
        account.setAccountId(accountId);
        account.setBalance(new BigDecimal("10.00"));
        account.setDebtMarginLimit(new BigDecimal("-3.00"));
        account.setStatus(AccountStatus.ACTIVE);
        account.setFareCategory(FareCategory.GENERAL);
        accountJpaRepository.save(account);

        CardJpaEntity card = new CardJpaEntity();
        card.setCardId("TRK-TRIP");
        card.setAccountId(accountId);
        card.setCardStatus(CardStatus.ACTIVE);
        cardJpaRepository.save(card);

        TripRequestDTO trip1 = new TripRequestDTO("VIA-100", "TRK-TRIP", new BigDecimal("1.20"), LocalDateTime.now().minusHours(1));
        TripRequestDTO trip2 = new TripRequestDTO("VIA-101", "TRK-TRIP", new BigDecimal("1.20"), LocalDateTime.now());

        TripBatchRequestDTO request = new TripBatchRequestDTO("BUS-201", List.of(trip1, trip2), "VALID_SIGNATURE", "KEY-1");

        ResponseEntity<TripBatchResponseDTO> response = restTemplate.postForEntity("/api/v1/trips/batch", request, TripBatchResponseDTO.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().successful());
        assertEquals(0, response.getBody().duplicates());
        assertEquals(0, response.getBody().errors());

        AccountJpaEntity updatedAccount = accountJpaRepository.findById(accountId).get();
        assertEquals(new BigDecimal("7.60"), updatedAccount.getBalance().setScale(2));
    }

    @Test
    public void shouldHandleDuplicateTripsInBatch() {
        UUID accountId = UUID.randomUUID();
        AccountJpaEntity account = new AccountJpaEntity();
        account.setAccountId(accountId);
        account.setBalance(new BigDecimal("10.00"));
        account.setDebtMarginLimit(new BigDecimal("-3.00"));
        account.setStatus(AccountStatus.ACTIVE);
        account.setFareCategory(FareCategory.GENERAL);
        accountJpaRepository.save(account);

        CardJpaEntity card = new CardJpaEntity();
        card.setCardId("TRK-TRIP2");
        card.setAccountId(accountId);
        card.setCardStatus(CardStatus.ACTIVE);
        cardJpaRepository.save(card);

        TripRequestDTO trip1 = new TripRequestDTO("VIA-200", "TRK-TRIP2", new BigDecimal("1.20"), LocalDateTime.now());

        TripBatchRequestDTO request = new TripBatchRequestDTO("BUS-201", List.of(trip1), "VALID_SIGNATURE", "KEY-1");

        // First request
        restTemplate.postForEntity("/api/v1/trips/batch", request, TripBatchResponseDTO.class);

        // Second request (Duplicate)
        ResponseEntity<TripBatchResponseDTO> response = restTemplate.postForEntity("/api/v1/trips/batch", request, TripBatchResponseDTO.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(0, response.getBody().successful());
        assertEquals(1, response.getBody().duplicates());
        assertEquals(0, response.getBody().errors());
    }

    @Test
    public void shouldHandleNonExistentCardInBatch() {
        TripRequestDTO trip1 = new TripRequestDTO("VIA-300", "TRK-NON-EXISTENT", new BigDecimal("1.20"), LocalDateTime.now());
        TripBatchRequestDTO request = new TripBatchRequestDTO("BUS-201", List.of(trip1), "VALID_SIGNATURE", "KEY-1");

        ResponseEntity<TripBatchResponseDTO> response = restTemplate.postForEntity("/api/v1/trips/batch", request, TripBatchResponseDTO.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(0, response.getBody().successful());
        assertEquals(0, response.getBody().duplicates());
        assertEquals(1, response.getBody().errors());
    }
}
