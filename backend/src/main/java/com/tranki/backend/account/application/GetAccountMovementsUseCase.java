package com.tranki.backend.account.application;

import com.tranki.backend.account.adapter.in.web.dto.AccountMovementsResponseDTO;
import com.tranki.backend.account.domain.Account;
import com.tranki.backend.account.domain.AccountMovement;
import com.tranki.backend.account.domain.AccountMovementRepository;
import com.tranki.backend.account.domain.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class GetAccountMovementsUseCase {

    private final AccountRepository accountRepository;
    private final AccountMovementRepository accountMovementRepository;

    public GetAccountMovementsUseCase(AccountRepository accountRepository, AccountMovementRepository accountMovementRepository) {
        this.accountRepository = accountRepository;
        this.accountMovementRepository = accountMovementRepository;
    }

    @Transactional(readOnly = true)
    public AccountMovementsResponseDTO execute(UUID userId, UUID accountId) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new IllegalArgumentException("Cuenta inexistente"));

        if (account.getUserId() == null) {
            throw new SecurityException("No se pueden consultar movimientos de una cuenta anónima");
        }

        if (!account.getUserId().equals(userId)) {
            throw new SecurityException("No autorizado para consultar los movimientos de esta cuenta");
        }

        List<AccountMovement> movements = accountMovementRepository.findByAccountIdOrderByDateDesc(accountId);
        return new AccountMovementsResponseDTO(account.getBalance().amount(), movements);
    }
}
