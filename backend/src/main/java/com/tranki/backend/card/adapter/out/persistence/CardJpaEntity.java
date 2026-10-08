package com.tranki.backend.card.adapter.out.persistence;

import com.tranki.backend.card.domain.CardStatus;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "cards")
public class CardJpaEntity {

    @Id
    private String cardId;
    private UUID accountId;
    
    @Enumerated(EnumType.STRING)
    private CardStatus cardStatus;
    
    private String verificationNumber;
    private String securityCodeHash;
    private UUID kioskAgentId;
    
    @Column(name = "failed_link_attempts")
    private Integer failedLinkAttempts = 0;

    public CardJpaEntity() {}

    public String getCardId() { return cardId; }
    public void setCardId(String cardId) { this.cardId = cardId; }
    public UUID getAccountId() { return accountId; }
    public void setAccountId(UUID accountId) { this.accountId = accountId; }
    public CardStatus getCardStatus() { return cardStatus; }
    public void setCardStatus(CardStatus cardStatus) { this.cardStatus = cardStatus; }
    public String getVerificationNumber() { return verificationNumber; }
    public void setVerificationNumber(String verificationNumber) { this.verificationNumber = verificationNumber; }
    public String getSecurityCodeHash() { return securityCodeHash; }
    public void setSecurityCodeHash(String securityCodeHash) { this.securityCodeHash = securityCodeHash; }
    public UUID getKioskAgentId() { return kioskAgentId; }
    public void setKioskAgentId(UUID kioskAgentId) { this.kioskAgentId = kioskAgentId; }
    public Integer getFailedLinkAttempts() { return failedLinkAttempts; }
    public void setFailedLinkAttempts(Integer failedLinkAttempts) { this.failedLinkAttempts = failedLinkAttempts; }
}
