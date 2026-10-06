package com.tranki.backend.card.application;

import com.tranki.backend.account.domain.Account;
import com.tranki.backend.account.domain.AccountRepository;
import com.tranki.backend.card.adapter.in.web.dto.LinkCardRequestDTO;
import com.tranki.backend.card.domain.Card;
import com.tranki.backend.card.domain.CardAlreadyLinkedException;
import com.tranki.backend.card.domain.CardBlockedException;
import com.tranki.backend.card.domain.CardRepository;
import com.tranki.backend.card.domain.CardStatus;
import com.tranki.backend.card.domain.InvalidSecurityCodeException;
import com.tranki.backend.card.domain.MaxLinkAttemptsExceededException;
import com.tranki.backend.card.domain.PasswordEncoderPort;
import com.tranki.backend.card.domain.UserRepositoryPort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LinkCardToUserUseCase {

    private final CardRepository cardRepository;
    private final AccountRepository accountRepository;
    private final UserRepositoryPort userRepositoryPort;
    private final PasswordEncoderPort passwordEncoderPort;

    public LinkCardToUserUseCase(CardRepository cardRepository, AccountRepository accountRepository, UserRepositoryPort userRepositoryPort, PasswordEncoderPort passwordEncoderPort) {
        this.cardRepository = cardRepository;
        this.accountRepository = accountRepository;
        this.userRepositoryPort = userRepositoryPort;
        this.passwordEncoderPort = passwordEncoderPort;
    }

    @Transactional(noRollbackFor = {InvalidSecurityCodeException.class, MaxLinkAttemptsExceededException.class})
    public void execute(LinkCardRequestDTO request) {
        if (!userRepositoryPort.existsById(request.userId())) {
            throw new IllegalArgumentException("User does not exist");
        }

        Card card = cardRepository.findById(request.cardId())
            .orElseThrow(() -> new IllegalArgumentException("Card not found"));

        if (card.getCardStatus() == CardStatus.IN_INVENTORY) {
            throw new IllegalStateException("Card is not activated yet");
        }
        if (card.getCardStatus() == CardStatus.LOST_REPORTED || card.getCardStatus() == CardStatus.FRAUD_BLOCKED) {
            throw new CardBlockedException("La tarjeta se encuentra bloqueada administrativamente.");
        }

        Account account = accountRepository.findById(card.getAccountId())
            .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        if (account.getUserId() != null) {
            throw new CardAlreadyLinkedException("Card is already linked to another user");
        }

        try {
            card.validateAndRegisterLinkAttempt(request.securityCode(), passwordEncoderPort);
        } finally {
            cardRepository.save(card);
        }

        account.linkUser(request.userId());
        accountRepository.save(account);
    }
}
