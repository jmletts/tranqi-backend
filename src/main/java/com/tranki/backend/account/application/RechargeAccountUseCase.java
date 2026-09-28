package com.tranki.backend.account.application;

import com.tranki.backend.account.adapter.in.web.dto.RechargeRequestDTO;
import com.tranki.backend.account.domain.Account;
import com.tranki.backend.account.domain.AccountRepository;
import com.tranki.backend.account.domain.RechargeTransaction;
import com.tranki.backend.account.domain.RechargeTransactionRepository;
import com.tranki.backend.card.domain.Card;
import com.tranki.backend.card.domain.CardBlockedException;
import com.tranki.backend.card.domain.CardRepository;
import com.tranki.backend.card.domain.CardStatus;
import com.tranki.backend.shared.domain.Money;
import com.tranki.backend.shared.domain.events.AccountUnlockedByRechargeEvent;
import com.tranki.backend.shared.domain.events.BlacklistRemovalOrderEvent;
import com.tranki.backend.shared.domain.events.RechargeConfirmedEvent;
import com.tranki.backend.shared.domain.events.RechargeRejectedAccountNotFoundEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class RechargeAccountUseCase {

    private final CardRepository cardRepository;
    private final AccountRepository accountRepository;
    private final RechargeTransactionRepository rechargeTransactionRepository;
    private final ApplicationEventPublisher eventPublisher;

    public RechargeAccountUseCase(CardRepository cardRepository, AccountRepository accountRepository, RechargeTransactionRepository rechargeTransactionRepository, ApplicationEventPublisher eventPublisher) {
        this.cardRepository = cardRepository;
        this.accountRepository = accountRepository;
        this.rechargeTransactionRepository = rechargeTransactionRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public void execute(RechargeRequestDTO request) {
        if (request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto a recargar debe ser mayor a cero");
        }

        if (rechargeTransactionRepository.existsById(request.transactionId())) {
            // Idempotencia: si ya se procesó, no hacemos nada ni lanzamos error
            return;
        }

        Card card = cardRepository.findById(request.cardId()).orElse(null);
        if (card == null) {
            eventPublisher.publishEvent(new RechargeRejectedAccountNotFoundEvent(request.transactionId(), request.cardId()));
            throw new IllegalArgumentException("Cuenta inexistente");
        }

        if (card.getCardStatus() == CardStatus.IN_INVENTORY) {
            throw new CardBlockedException("Tarjeta en inventario no puede recibir recargas");
        }
        if (card.getCardStatus() == CardStatus.FRAUD_BLOCKED) {
            throw new CardBlockedException("Tarjeta bloqueada por fraude");
        }
        if (card.getCardStatus() == CardStatus.LOST_REPORTED) {
            throw new CardBlockedException("Tarjeta reportada como perdida");
        }

        Account account = accountRepository.findById(card.getAccountId())
            .orElseThrow(() -> new IllegalStateException("Card is not linked to any account"));

        boolean wasDebtBlocked = (card.getCardStatus() == CardStatus.BLOCKED_DEBT);
        
        Money amountToAdd = Money.of(request.amount().toString());
        account.addBalance(amountToAdd);
        
        if (wasDebtBlocked && account.getBalance().amount().compareTo(BigDecimal.ZERO) > 0) {
            card.unlockFromDebt();
            cardRepository.save(card);
            eventPublisher.publishEvent(new AccountUnlockedByRechargeEvent(account.getAccountId(), card.getCardId()));
            eventPublisher.publishEvent(new BlacklistRemovalOrderEvent(card.getCardId(), "Deuda saldada por recarga"));
        }

        accountRepository.save(account);

        RechargeTransaction transaction = new RechargeTransaction(
            request.transactionId(),
            account.getAccountId(),
            amountToAdd,
            request.origin(),
            LocalDateTime.now()
        );
        rechargeTransactionRepository.save(transaction);

        eventPublisher.publishEvent(new RechargeConfirmedEvent(request.transactionId(), account.getAccountId(), card.getCardId(), amountToAdd));
    }
}
