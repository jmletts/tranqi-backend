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

    public AccountController(RechargeAccountUseCase rechargeAccountUseCase, com.tranki.backend.account.application.TransferFundsUseCase transferFundsUseCase) {
        this.rechargeAccountUseCase = rechargeAccountUseCase;
        this.transferFundsUseCase = transferFundsUseCase;
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
}
