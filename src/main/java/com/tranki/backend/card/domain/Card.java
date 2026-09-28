package com.tranki.backend.card.domain;

import java.util.UUID;

public class Card {
    private final String cardId;
    private UUID accountId;
    private CardStatus cardStatus;
    private String verificationNumber;
    private String securityCodeHash;
    private UUID kioskAgentId;
    private int failedLinkAttempts;

    public Card(String cardId, UUID accountId, CardStatus cardStatus, String verificationNumber, String securityCodeHash, UUID kioskAgentId) {
        this(cardId, accountId, cardStatus, verificationNumber, securityCodeHash, kioskAgentId, 0);
    }

    public Card(String cardId, UUID accountId, CardStatus cardStatus, String verificationNumber, String securityCodeHash, UUID kioskAgentId, int failedLinkAttempts) {
        this.cardId = cardId;
        this.accountId = accountId;
        this.cardStatus = cardStatus;
        this.verificationNumber = verificationNumber;
        this.securityCodeHash = securityCodeHash;
        this.kioskAgentId = kioskAgentId;
        this.failedLinkAttempts = failedLinkAttempts;
    }

    public static Card createInventoryCard(String cardId) {
        return new Card(cardId, null, CardStatus.IN_INVENTORY, null, null, null);
    }

    public void validateAndRegisterLinkAttempt(String plainSecurityCode, PasswordEncoderPort encoder) {
        if (this.failedLinkAttempts >= 5) {
            throw new MaxLinkAttemptsExceededException("Se ha excedido el numero maximo de intentos permitidos.");
        }
        if (!encoder.matches(plainSecurityCode, this.securityCodeHash)) {
            this.failedLinkAttempts++;
            if (this.failedLinkAttempts >= 5) {
                throw new MaxLinkAttemptsExceededException("Se ha excedido el numero maximo de intentos permitidos.");
            }
            throw new InvalidSecurityCodeException("Codigo de seguridad invalido.");
        }
        this.failedLinkAttempts = 0;
    }

    public void issue(UUID accountId, UUID kioskAgentId, String verificationNumber, String securityCodeHash) {
        if (this.cardStatus != CardStatus.IN_INVENTORY) {
            throw new IllegalStateException("Card is not IN_INVENTORY");
        }
        this.accountId = accountId;
        this.kioskAgentId = kioskAgentId;
        this.verificationNumber = verificationNumber;
        this.securityCodeHash = securityCodeHash;
        this.cardStatus = CardStatus.ACTIVE;
    }

    public String getCardId() { return cardId; }
    public UUID getAccountId() { return accountId; }
    public CardStatus getCardStatus() { return cardStatus; }
    public String getVerificationNumber() { return verificationNumber; }
    public String getSecurityCodeHash() { return securityCodeHash; }
    public UUID getKioskAgentId() { return kioskAgentId; }
    public int getFailedLinkAttempts() { return failedLinkAttempts; }
}
