package com.tranki.backend.card.application;

import com.tranki.backend.account.domain.Account;
import com.tranki.backend.account.domain.AccountRepository;
import com.tranki.backend.blacklist.domain.BlacklistEntry;
import com.tranki.backend.blacklist.domain.BlacklistRepository;
import com.tranki.backend.blacklist.domain.BlockReason;
import com.tranki.backend.card.domain.Card;
import com.tranki.backend.card.domain.CardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class ReportCardLostUseCase {

    private final CardRepository cardRepository;
    private final AccountRepository accountRepository;
    private final BlacklistRepository blacklistRepository;

    public ReportCardLostUseCase(
            CardRepository cardRepository,
            AccountRepository accountRepository,
            BlacklistRepository blacklistRepository) {
        this.cardRepository = cardRepository;
        this.accountRepository = accountRepository;
        this.blacklistRepository = blacklistRepository;
    }

    @Transactional
    public void execute(UUID executingUserId, String cardId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("Tarjeta no encontrada: " + cardId));

        if (card.getAccountId() == null) {
            throw new IllegalStateException("La tarjeta no tiene una cuenta asociada.");
        }

        Account account = accountRepository.findById(card.getAccountId())
                .orElseThrow(() -> new IllegalArgumentException("Cuenta no encontrada."));

        if (account.getUserId() == null || !account.getUserId().equals(executingUserId)) {
            throw new SecurityException("No autorizado para bloquear esta tarjeta.");
        }

        card.reportLost();
        cardRepository.save(card);

        long nextVersion = blacklistRepository.incrementAndGetGlobalVersion();
        blacklistRepository.save(new BlacklistEntry(
                card.getCardId(),
                BlockReason.LOST_STOLEN,
                nextVersion,
                true,
                Instant.now()
        ));
    }
}
