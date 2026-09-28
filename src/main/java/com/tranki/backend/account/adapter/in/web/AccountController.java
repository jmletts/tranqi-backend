package com.tranki.backend.account.adapter.in.web;

import com.tranki.backend.account.adapter.in.web.dto.RechargeRequestDTO;
import com.tranki.backend.account.application.RechargeAccountUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/accounts")
public class AccountController {

    private final RechargeAccountUseCase rechargeAccountUseCase;
    private final com.tranki.backend.account.application.TransferFundsUseCase transferFundsUseCase;
    private final com.tranki.backend.account.application.GetAccountMovementsUseCase getAccountMovementsUseCase;

    public AccountController(RechargeAccountUseCase rechargeAccountUseCase, 
                             com.tranki.backend.account.application.TransferFundsUseCase transferFundsUseCase,
                             com.tranki.backend.account.application.GetAccountMovementsUseCase getAccountMovementsUseCase) {
        this.rechargeAccountUseCase = rechargeAccountUseCase;
        this.transferFundsUseCase = transferFundsUseCase;
        this.getAccountMovementsUseCase = getAccountMovementsUseCase;
    }

    @PostMapping("/recharge")
    public ResponseEntity<Void> recharge(@RequestBody RechargeRequestDTO request) {
        rechargeAccountUseCase.execute(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/{userId}/accounts/transfer")
    public ResponseEntity<Void> transfer(@org.springframework.web.bind.annotation.PathVariable java.util.UUID userId, @RequestBody com.tranki.backend.account.adapter.in.web.dto.TransferRequestDTO request) {
        transferFundsUseCase.execute(userId, request);
        return ResponseEntity.ok().build();
    }

    @org.springframework.web.bind.annotation.GetMapping("/users/{userId}/accounts/{accountId}/movements")
    public ResponseEntity<com.tranki.backend.account.adapter.in.web.dto.AccountMovementsResponseDTO> getMovements(
            @org.springframework.web.bind.annotation.PathVariable java.util.UUID userId,
            @org.springframework.web.bind.annotation.PathVariable java.util.UUID accountId) {
        return ResponseEntity.ok(getAccountMovementsUseCase.execute(userId, accountId));
    }
}
