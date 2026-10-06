package com.tranki.backend.e2e;

import com.tranki.backend.account.adapter.in.web.dto.AccountMovementsResponseDTO;
import com.tranki.backend.account.adapter.in.web.dto.RechargeRequestDTO;
import com.tranki.backend.account.adapter.in.web.dto.TransferRequestDTO;
import com.tranki.backend.account.adapter.out.persistence.AccountJpaEntity;
import com.tranki.backend.account.domain.AccountStatus;
import com.tranki.backend.account.domain.FareCategory;
import com.tranki.backend.card.adapter.out.persistence.CardJpaEntity;
import com.tranki.backend.card.domain.CardStatus;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

public class AccountControllerE2ETest extends BaseE2ETest {

    @Test
    public void shouldRechargeSuccessfully() {
        UUID accountId = UUID.randomUUID();
        AccountJpaEntity account = new AccountJpaEntity();
        account.setAccountId(accountId);
        account.setBalance(BigDecimal.ZERO);
        account.setDebtMarginLimit(new BigDecimal("-3.00"));
        account.setStatus(AccountStatus.ACTIVE);
        account.setFareCategory(FareCategory.GENERAL);
        accountJpaRepository.save(account);

        CardJpaEntity card = new CardJpaEntity();
        card.setCardId("TRK-RECHARGE");
        card.setAccountId(accountId);
        card.setCardStatus(CardStatus.ACTIVE);
        cardJpaRepository.save(card);

        RechargeRequestDTO request = new RechargeRequestDTO("TRX-001", "TRK-RECHARGE", new BigDecimal("20.00"), "KIOSK");

        ResponseEntity<Void> response = restTemplate.postForEntity("/api/v1/accounts/recharge", request, Void.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        
        AccountJpaEntity updatedAccount = accountJpaRepository.findById(accountId).get();
        assertEquals(new BigDecimal("20.00"), updatedAccount.getBalance().setScale(2));
    }

    @Test
    public void shouldTransferFundsSuccessfully() {
        UUID userId = UUID.randomUUID();
        UUID originAccountId = UUID.randomUUID();
        UUID destAccountId = UUID.randomUUID();

        AccountJpaEntity originAccount = new AccountJpaEntity();
        originAccount.setAccountId(originAccountId);
        originAccount.setUserId(userId);
        originAccount.setBalance(new BigDecimal("50.00"));
        originAccount.setDebtMarginLimit(new BigDecimal("-3.00"));
        originAccount.setStatus(AccountStatus.ACTIVE);
        originAccount.setFareCategory(FareCategory.GENERAL);
        accountJpaRepository.save(originAccount);

        AccountJpaEntity destAccount = new AccountJpaEntity();
        destAccount.setAccountId(destAccountId);
        destAccount.setUserId(userId);
        destAccount.setBalance(new BigDecimal("10.00"));
        destAccount.setDebtMarginLimit(new BigDecimal("-3.00"));
        destAccount.setStatus(AccountStatus.ACTIVE);
        destAccount.setFareCategory(FareCategory.GENERAL);
        accountJpaRepository.save(destAccount);

        CardJpaEntity originCard = new CardJpaEntity();
        originCard.setCardId("TRK-ORIGIN");
        originCard.setAccountId(originAccountId);
        originCard.setCardStatus(CardStatus.ACTIVE);
        cardJpaRepository.save(originCard);

        CardJpaEntity destCard = new CardJpaEntity();
        destCard.setCardId("TRK-DEST");
        destCard.setAccountId(destAccountId);
        destCard.setCardStatus(CardStatus.ACTIVE);
        cardJpaRepository.save(destCard);

        TransferRequestDTO request = new TransferRequestDTO(originAccountId, destAccountId, new BigDecimal("15.00"));

        ResponseEntity<Void> response = restTemplate.postForEntity("/api/v1/accounts/users/" + userId + "/accounts/transfer", request, Void.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());

        assertEquals(new BigDecimal("35.00"), accountJpaRepository.findById(originAccountId).get().getBalance().setScale(2));
        assertEquals(new BigDecimal("25.00"), accountJpaRepository.findById(destAccountId).get().getBalance().setScale(2));
    }

    @Test
    public void shouldGetAccountMovementsSuccessfully() {
        UUID userId = UUID.randomUUID();
        UUID accountId = UUID.randomUUID();

        AccountJpaEntity account = new AccountJpaEntity();
        account.setAccountId(accountId);
        account.setUserId(userId);
        account.setBalance(new BigDecimal("20.00"));
        account.setDebtMarginLimit(new BigDecimal("-3.00"));
        account.setStatus(AccountStatus.ACTIVE);
        account.setFareCategory(FareCategory.GENERAL);
        accountJpaRepository.save(account);

        ResponseEntity<AccountMovementsResponseDTO> response = restTemplate.getForEntity(
                "/api/v1/accounts/users/" + userId + "/accounts/" + accountId + "/movements", 
                AccountMovementsResponseDTO.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(0, response.getBody().movements().size());
        assertEquals(new BigDecimal("20.00"), response.getBody().currentBalance().setScale(2));
    }
}
