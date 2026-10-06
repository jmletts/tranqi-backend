package com.tranki.backend.card.application;

import com.tranki.backend.account.domain.Account;
import com.tranki.backend.account.domain.AccountRepository;
import com.tranki.backend.account.domain.FareCategory;
import com.tranki.backend.card.adapter.in.web.dto.ChangeFareCategoryRequestDTO;
import com.tranki.backend.card.domain.Card;
import com.tranki.backend.card.domain.CardBlockedException;
import com.tranki.backend.card.domain.CardRepository;
import com.tranki.backend.card.domain.CardStatus;
import com.tranki.backend.card.domain.DocumentValidatorPort;
import com.tranki.backend.card.domain.InvalidDocumentException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ChangeFareCategoryUseCase {

    private final CardRepository cardRepository;
    private final AccountRepository accountRepository;
    private final DocumentValidatorPort documentValidatorPort;

    public ChangeFareCategoryUseCase(CardRepository cardRepository, AccountRepository accountRepository, DocumentValidatorPort documentValidatorPort) {
        this.cardRepository = cardRepository;
        this.accountRepository = accountRepository;
        this.documentValidatorPort = documentValidatorPort;
    }

    @Transactional
    public void execute(ChangeFareCategoryRequestDTO request) {
        // 1. Obtener la Tarjeta por el accountId
        Card card = cardRepository.findByAccountId(request.accountId())
            .orElseThrow(() -> new IllegalArgumentException("Card not found for account: " + request.accountId()));

        // 2. Verificar que no esté bloqueada
        if (card.getCardStatus() == CardStatus.LOST_REPORTED || card.getCardStatus() == CardStatus.FRAUD_BLOCKED) {
            throw new CardBlockedException("La tarjeta se encuentra bloqueada por estado: " + card.getCardStatus());
        }

        // 3. Validar categoría destino y documento
        FareCategory newCategory;
        try {
            newCategory = FareCategory.valueOf(request.fareCategory().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid FareCategory: " + request.fareCategory());
        }

        if (newCategory == FareCategory.SCHOOL || newCategory == FareCategory.UNIVERSITY) {
            boolean isValid = documentValidatorPort.isValidForCategory(request.documentNumber(), newCategory);
            if (!isValid) {
                throw new InvalidDocumentException("Documento invalido para la categoria " + newCategory);
            }
        }

        // 4. Actualizar la Cuenta
        Account account = accountRepository.findById(request.accountId())
            .orElseThrow(() -> new IllegalArgumentException("Account not found: " + request.accountId()));

        account.changeFareCategory(newCategory);
        accountRepository.save(account);
    }
}
