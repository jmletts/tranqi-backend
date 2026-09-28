package com.tranki.backend.card.application;

import com.tranki.backend.account.domain.Account;
import com.tranki.backend.account.domain.AccountRepository;
import com.tranki.backend.account.domain.FareCategory;
import com.tranki.backend.card.adapter.in.web.dto.IssueCardRequestDTO;
import com.tranki.backend.card.adapter.in.web.dto.IssueCardResponseDTO;
import com.tranki.backend.card.domain.Card;
import com.tranki.backend.card.domain.CardRepository;
import com.tranki.backend.card.domain.DocumentValidatorPort;
import com.tranki.backend.card.domain.InvalidDocumentException;
import com.tranki.backend.shared.domain.Money;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.UUID;

@Service
public class IssueCardUseCase {

    private final CardRepository cardRepository;
    private final AccountRepository accountRepository;
    private final DocumentValidatorPort documentValidatorPort;
    private final SecureRandom secureRandom = new SecureRandom();

    public IssueCardUseCase(CardRepository cardRepository, AccountRepository accountRepository, DocumentValidatorPort documentValidatorPort) {
        this.cardRepository = cardRepository;
        this.accountRepository = accountRepository;
        this.documentValidatorPort = documentValidatorPort;
    }

    @Transactional
    public IssueCardResponseDTO execute(IssueCardRequestDTO request) {
        Card card = cardRepository.findById(request.cardId())
            .orElseThrow(() -> new IllegalArgumentException("Card not found: " + request.cardId()));

        FareCategory category;
        try {
            category = FareCategory.valueOf(request.fareCategory().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid FareCategory: " + request.fareCategory());
        }

        if (category == FareCategory.SCHOOL || category == FareCategory.UNIVERSITY) {
            boolean isValid = documentValidatorPort.isValidForCategory(request.documentNumber(), category);
            if (!isValid) {
                throw new InvalidDocumentException("Documento invalido para la categoria " + category);
            }
        }

        Money initialBalance = category == FareCategory.SCHOOL ? Money.of("2.50") : Money.of("5.00");
        
        UUID accountId = UUID.randomUUID();
        Account newAccount = Account.createAnonymous(accountId, category, initialBalance);

        String verificationNumber = generateUniqueVerificationNumber();
        String dummySecurityHash = "dummy-hash-1234";

        card.issue(newAccount.getAccountId(), request.kioskAgentId(), verificationNumber, dummySecurityHash);

        accountRepository.save(newAccount);
        cardRepository.save(card);

        return new IssueCardResponseDTO(
            card.getCardId(),
            newAccount.getAccountId(),
            card.getVerificationNumber(),
            card.getCardStatus().name()
        );
    }

    private String generateUniqueVerificationNumber() {
        for (int i = 0; i < 5; i++) {
            StringBuilder sb = new StringBuilder(12);
            for (int j = 0; j < 12; j++) {
                sb.append(secureRandom.nextInt(10));
            }
            String candidate = sb.toString();
            if (!cardRepository.existsByVerificationNumber(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Failed to generate unique verification number after 5 attempts");
    }
}
