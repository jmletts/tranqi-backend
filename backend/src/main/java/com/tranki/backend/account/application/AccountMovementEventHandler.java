package com.tranki.backend.account.application;

import com.tranki.backend.account.domain.AccountMovement;
import com.tranki.backend.account.domain.AccountMovementRepository;
import com.tranki.backend.card.domain.Card;
import com.tranki.backend.card.domain.CardRepository;
import com.tranki.backend.shared.domain.Money;
import com.tranki.backend.shared.domain.events.RechargeConfirmedEvent;
import com.tranki.backend.shared.domain.events.TransferConfirmedEvent;
import com.tranki.backend.shared.domain.events.TripProcessedSuccessfullyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class AccountMovementEventHandler {

    private final AccountMovementRepository movementRepository;
    private final CardRepository cardRepository;

    public AccountMovementEventHandler(AccountMovementRepository movementRepository, CardRepository cardRepository) {
        this.movementRepository = movementRepository;
        this.cardRepository = cardRepository;
    }

    @EventListener
    public void onRechargeConfirmed(RechargeConfirmedEvent event) {
        String identifier = "REC-" + event.transactionId();
        AccountMovement movement = new AccountMovement(
                "RECARGA",
                identifier,
                event.amount(),
                LocalDateTime.now(),
                "Recarga confirmada en tarjeta " + event.cardId()
        );
        movementRepository.save(event.accountId(), movement);
    }

    @EventListener
    public void onTransferConfirmed(TransferConfirmedEvent event) {
        LocalDateTime now = LocalDateTime.now();
        String baseRef = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        String originCardId = cardRepository.findByAccountId(event.originAccountId())
                .map(Card::getCardId)
                .orElse(event.originAccountId().toString().substring(0, 8));
        String destCardId = cardRepository.findByAccountId(event.destinationAccountId())
                .map(Card::getCardId)
                .orElse(event.destinationAccountId().toString().substring(0, 8));

        AccountMovement outgoing = new AccountMovement(
                "TRANSFERENCIA_ENVIADA",
                "TRF-OUT-" + baseRef,
                event.amount(),
                now,
                "Transferencia enviada hacia tarjeta " + destCardId
        );
        movementRepository.save(event.originAccountId(), outgoing);

        AccountMovement incoming = new AccountMovement(
                "TRANSFERENCIA_RECIBIDA",
                "TRF-IN-" + baseRef,
                event.amount(),
                now,
                "Transferencia recibida desde tarjeta " + originCardId
        );
        movementRepository.save(event.destinationAccountId(), incoming);
    }

    @EventListener
    public void onTripProcessed(TripProcessedSuccessfullyEvent event) {
        cardRepository.findById(event.cardId()).ifPresent(card -> {
            if (card.getAccountId() != null) {
                AccountMovement movement = new AccountMovement(
                        "VIAJE",
                        "VIA-" + event.tripId(),
                        new Money(event.fareAmount()),
                        LocalDateTime.now(),
                        "Viaje registrado en unidad " + (event.busId() != null ? event.busId() : "Transporte Urbano")
                );
                movementRepository.save(card.getAccountId(), movement);
            }
        });
    }
}
