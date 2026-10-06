package com.tranki.backend.trip.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tranki.backend.account.domain.Account;
import com.tranki.backend.account.domain.AccountRepository;
import com.tranki.backend.card.domain.Card;
import com.tranki.backend.card.domain.CardRepository;
import com.tranki.backend.shared.domain.Money;
import com.tranki.backend.shared.domain.events.CardBlockedByDebtEvent;
import com.tranki.backend.shared.domain.events.TripDiscardedForDuplicateEvent;
import com.tranki.backend.shared.domain.events.TripGeneratedExcessDebtRequiresReviewEvent;
import com.tranki.backend.shared.domain.events.TripProcessedSuccessfullyEvent;
import com.tranki.backend.trip.adapter.in.web.dto.TripBatchRequestDTO;
import com.tranki.backend.trip.adapter.in.web.dto.TripBatchResponseDTO;
import com.tranki.backend.trip.adapter.in.web.dto.TripRequestDTO;
import com.tranki.backend.trip.application.port.out.TripBatchSignatureValidatorPort;
import com.tranki.backend.trip.domain.Trip;
import com.tranki.backend.trip.domain.TripRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class ProcessTripBatchUseCase {

    private final TripRepository tripRepository;
    private final CardRepository cardRepository;
    private final AccountRepository accountRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final TripBatchSignatureValidatorPort signatureValidator;
    private final ObjectMapper objectMapper;

    public ProcessTripBatchUseCase(TripRepository tripRepository, CardRepository cardRepository, AccountRepository accountRepository, ApplicationEventPublisher eventPublisher, TripBatchSignatureValidatorPort signatureValidator, ObjectMapper objectMapper) {
        this.tripRepository = tripRepository;
        this.cardRepository = cardRepository;
        this.accountRepository = accountRepository;
        this.eventPublisher = eventPublisher;
        this.signatureValidator = signatureValidator;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public TripBatchResponseDTO execute(TripBatchRequestDTO request) {
        // Validación criptográfica síncrona
        try {
            // Reconstruir el payload exacto que el ESP32 firmó: "busId|JSON(trips)"
            String tripsJson = objectMapper.writeValueAsString(request.trips());
            String payload = request.busId() + "|" + tripsJson;
            signatureValidator.validateSignature(request.busId(), payload, request.signature());
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            throw new IllegalArgumentException("Error al serializar el payload de viajes para verificación", e);
        }

        int successful = 0;
        int duplicates = 0;
        int errors = 0;

        for (TripRequestDTO tripDto : request.trips()) {
            try {
                if (tripDto.localTimestamp().isAfter(LocalDateTime.now())) {
                    errors++;
                    continue;
                }

                if (tripRepository.findById(tripDto.tripId()).isPresent()) {
                    duplicates++;
                    eventPublisher.publishEvent(new TripDiscardedForDuplicateEvent(tripDto.tripId()));
                    continue;
                }

                Card card = cardRepository.findById(tripDto.cardId()).orElse(null);
                if (card == null) {
                    errors++;
                    continue;
                }

                Account account = accountRepository.findById(card.getAccountId()).orElseThrow();
                Money fare = Money.of(tripDto.fare().toString());

                account.forceSubtractBalance(fare);

                boolean requiresReview = account.getBalance().isLessThan(account.getDebtMarginLimit());
                
                if (account.getBalance().amount().compareTo(BigDecimal.ZERO) < 0) {
                    card.blockByDebt();
                    cardRepository.save(card);
                    eventPublisher.publishEvent(new CardBlockedByDebtEvent(card.getCardId()));
                }

                accountRepository.save(account);

                String processingStatus = "PROCESADO";
                
                Trip trip = new Trip(tripDto.tripId(), tripDto.cardId(), account.getAccountId(), fare, tripDto.localTimestamp(), processingStatus, requiresReview);
                tripRepository.save(trip);

                if (requiresReview) {
                    eventPublisher.publishEvent(new TripGeneratedExcessDebtRequiresReviewEvent(tripDto.tripId(), tripDto.cardId()));
                }

                eventPublisher.publishEvent(new TripProcessedSuccessfullyEvent(tripDto.tripId(), tripDto.cardId(), request.busId(), fare.amount()));
                successful++;

            } catch (Exception e) {
                errors++;
            }
        }

        return new TripBatchResponseDTO(successful, duplicates, errors);
    }
}
