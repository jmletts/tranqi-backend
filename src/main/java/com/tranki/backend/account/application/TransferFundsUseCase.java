package com.tranki.backend.account.application;

import com.tranki.backend.account.adapter.in.web.dto.TransferRequestDTO;
import com.tranki.backend.account.domain.Account;
import com.tranki.backend.account.domain.AccountRepository;
import com.tranki.backend.card.domain.Card;
import com.tranki.backend.card.domain.CardBlockedException;
import com.tranki.backend.card.domain.CardRepository;
import com.tranki.backend.card.domain.CardStatus;
import com.tranki.backend.shared.domain.Money;
import com.tranki.backend.shared.domain.events.AccountUnlockedByRechargeEvent;
import com.tranki.backend.shared.domain.events.BlacklistRemovalOrderEvent;
import com.tranki.backend.shared.domain.events.TransferConfirmedEvent;
import com.tranki.backend.shared.domain.events.TransferRejectedByDebtLimitEvent;
import com.tranki.backend.shared.domain.events.TransferRejectedByUnauthorizedAccountEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class TransferFundsUseCase {

    private final AccountRepository accountRepository;
    private final CardRepository cardRepository;
    private final ApplicationEventPublisher eventPublisher;

    public TransferFundsUseCase(AccountRepository accountRepository, CardRepository cardRepository, ApplicationEventPublisher eventPublisher) {
        this.accountRepository = accountRepository;
        this.cardRepository = cardRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(noRollbackFor = {IllegalArgumentException.class, IllegalStateException.class, SecurityException.class})
    public void execute(UUID executingUserId, TransferRequestDTO request) {
        if (request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto a transferir debe ser mayor a cero");
        }

        Account origin = accountRepository.findById(request.originAccountId())
            .orElseThrow(() -> new IllegalArgumentException("Cuenta origen inexistente"));
        Account destination = accountRepository.findById(request.destinationAccountId())
            .orElseThrow(() -> new IllegalArgumentException("Cuenta destino inexistente"));

        if (origin.getUserId() == null || !origin.getUserId().equals(executingUserId)) {
            eventPublisher.publishEvent(new TransferRejectedByUnauthorizedAccountEvent(origin.getAccountId(), executingUserId));
            throw new SecurityException("No autorizado para operar la cuenta origen");
        }
        if (destination.getUserId() == null || !destination.getUserId().equals(executingUserId)) {
            eventPublisher.publishEvent(new TransferRejectedByUnauthorizedAccountEvent(destination.getAccountId(), executingUserId));
            throw new SecurityException("No autorizado para operar la cuenta destino");
        }

        Card originCard = cardRepository.findByAccountId(origin.getAccountId())
            .orElseThrow(() -> new IllegalStateException("Tarjeta origen no encontrada"));
        Card destCard = cardRepository.findByAccountId(destination.getAccountId())
            .orElseThrow(() -> new IllegalStateException("Tarjeta destino no encontrada"));

        if (originCard.getCardStatus() == CardStatus.LOST_REPORTED || originCard.getCardStatus() == CardStatus.FRAUD_BLOCKED) {
            eventPublisher.publishEvent(new TransferRejectedByUnauthorizedAccountEvent(origin.getAccountId(), executingUserId));
            throw new SecurityException("Tarjeta origen bloqueada por pérdida o fraude");
        }
        if (destCard.getCardStatus() == CardStatus.LOST_REPORTED || destCard.getCardStatus() == CardStatus.FRAUD_BLOCKED) {
            eventPublisher.publishEvent(new TransferRejectedByUnauthorizedAccountEvent(destination.getAccountId(), executingUserId));
            throw new SecurityException("Tarjeta destino bloqueada por pérdida o fraude");
        }

        Money amountToTransfer = Money.of(request.amount().toString());

        try {
            origin.subtractBalance(amountToTransfer);
        } catch (IllegalStateException e) {
            eventPublisher.publishEvent(new TransferRejectedByDebtLimitEvent(origin.getAccountId()));
            throw e;
        }

        boolean destWasDebtBlocked = (destCard.getCardStatus() == CardStatus.BLOCKED_DEBT);
        
        destination.addBalance(amountToTransfer);

        if (destWasDebtBlocked && destination.getBalance().amount().compareTo(BigDecimal.ZERO) > 0) {
            destCard.unlockFromDebt();
            cardRepository.save(destCard);
            eventPublisher.publishEvent(new AccountUnlockedByRechargeEvent(destination.getAccountId(), destCard.getCardId()));
            eventPublisher.publishEvent(new BlacklistRemovalOrderEvent(destCard.getCardId(), "Deuda saldada por transferencia"));
        }

        accountRepository.save(origin);
        accountRepository.save(destination);

        eventPublisher.publishEvent(new TransferConfirmedEvent(origin.getAccountId(), destination.getAccountId(), amountToTransfer));
    }
}
