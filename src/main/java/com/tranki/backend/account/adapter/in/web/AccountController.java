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

    public AccountController(RechargeAccountUseCase rechargeAccountUseCase) {
        this.rechargeAccountUseCase = rechargeAccountUseCase;
    }

    @PostMapping("/recharge")
    public ResponseEntity<Void> recharge(@RequestBody RechargeRequestDTO request) {
        rechargeAccountUseCase.execute(request);
        return ResponseEntity.ok().build();
    }
}
