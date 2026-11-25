package com.tranki.backend.account.adapter.in.web;

import com.tranki.backend.account.adapter.in.web.dto.AccountMovementsResponseDTO;
import com.tranki.backend.account.adapter.in.web.dto.RechargeRequestDTO;
import com.tranki.backend.account.adapter.in.web.dto.TransferRequestDTO;
import com.tranki.backend.account.adapter.in.web.dto.TravelerMovementsResponseDTO;
import com.tranki.backend.account.application.GetAccountMovementsUseCase;
import com.tranki.backend.account.application.GetUserMovementsUseCase;
import com.tranki.backend.account.application.RechargeAccountUseCase;
import com.tranki.backend.account.application.TransferFundsUseCase;
import com.tranki.backend.iam.domain.User;
import com.tranki.backend.iam.infrastructure.security.AuthenticatedUserResolver;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/accounts")
public class AccountController {

    private final RechargeAccountUseCase rechargeAccountUseCase;
    private final TransferFundsUseCase transferFundsUseCase;
    private final GetAccountMovementsUseCase getAccountMovementsUseCase;
    private final GetUserMovementsUseCase getUserMovementsUseCase;
    private final AuthenticatedUserResolver authenticatedUserResolver;

    public AccountController(
            RechargeAccountUseCase rechargeAccountUseCase,
            TransferFundsUseCase transferFundsUseCase,
            GetAccountMovementsUseCase getAccountMovementsUseCase,
            GetUserMovementsUseCase getUserMovementsUseCase,
            AuthenticatedUserResolver authenticatedUserResolver) {
        this.rechargeAccountUseCase = rechargeAccountUseCase;
        this.transferFundsUseCase = transferFundsUseCase;
        this.getAccountMovementsUseCase = getAccountMovementsUseCase;
        this.getUserMovementsUseCase = getUserMovementsUseCase;
        this.authenticatedUserResolver = authenticatedUserResolver;
    }

    @PostMapping("/recharge")
    public ResponseEntity<Void> recharge(@RequestBody RechargeRequestDTO request) {
        rechargeAccountUseCase.execute(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me/movements")
    public ResponseEntity<TravelerMovementsResponseDTO> getMyMovements(
            @RequestParam(name = "accountId", required = false) UUID accountId) {
        User currentUser = authenticatedUserResolver.requireAuthenticatedUser();
        return ResponseEntity.ok(getUserMovementsUseCase.execute(currentUser.getId(), accountId));
    }

    @PostMapping("/me/transfer")
    public ResponseEntity<?> transferMyFunds(@RequestBody TransferRequestDTO request) {
        User currentUser = authenticatedUserResolver.requireAuthenticatedUser();
        if (request.originAccountId() == null || request.destinationAccountId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Debe seleccionar tarjeta origen y destino"));
        }
        if (request.originAccountId().equals(request.destinationAccountId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "La tarjeta origen y destino deben ser diferentes"));
        }
        try {
            transferFundsUseCase.execute(currentUser.getId(), request);
            return ResponseEntity.ok(Map.of("status", "OK", "message", "Transferencia realizada con éxito"));
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/users/{userId}/accounts/transfer")
    public ResponseEntity<Void> transfer(@PathVariable UUID userId, @RequestBody TransferRequestDTO request) {
        authenticatedUserResolver.getAuthenticatedUser().ifPresent(authUser -> {
            if (!authUser.getId().equals(userId)) {
                throw new SecurityException("No autorizado para operar cuentas de otro usuario");
            }
        });
        transferFundsUseCase.execute(userId, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/users/{userId}/accounts/{accountId}/movements")
    public ResponseEntity<AccountMovementsResponseDTO> getMovements(
            @PathVariable UUID userId,
            @PathVariable UUID accountId) {
        authenticatedUserResolver.getAuthenticatedUser().ifPresent(authUser -> {
            if (!authUser.getId().equals(userId)) {
                throw new SecurityException("No autorizado para consultar movimientos de otro usuario");
            }
        });
        return ResponseEntity.ok(getAccountMovementsUseCase.execute(userId, accountId));
    }
}
