package com.tranki.backend.agent.adapter.in.web;

import com.tranki.backend.agent.adapter.in.web.dto.*;
import com.tranki.backend.agent.application.AgentService;
import com.tranki.backend.card.domain.InvalidDocumentException;
import com.tranki.backend.iam.domain.User;
import com.tranki.backend.iam.infrastructure.security.AuthenticatedUserResolver;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/agent")
public class AgentController {

    private final AgentService agentService;
    private final AuthenticatedUserResolver authenticatedUserResolver;

    public AgentController(AgentService agentService, AuthenticatedUserResolver authenticatedUserResolver) {
        this.agentService = agentService;
        this.authenticatedUserResolver = authenticatedUserResolver;
    }

    @PostMapping("/register")
    public ResponseEntity<AgentRegisterResponseDTO> registerAsAgent(@RequestBody AgentRegisterRequestDTO request) {
        User currentUser = authenticatedUserResolver.requireAuthenticatedUser();
        return ResponseEntity.ok(agentService.registerAgent(currentUser, request));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('AGENTE_KIOSKO')")
    public ResponseEntity<AgentDashboardResponseDTO> getDashboard() {
        User currentUser = authenticatedUserResolver.requireAuthenticatedUser();
        return ResponseEntity.ok(agentService.getDashboard(currentUser));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('AGENTE_KIOSKO')")
    public ResponseEntity<AgentRegisterResponseDTO> updateProfile(@RequestBody UpdateAgentProfileRequestDTO request) {
        User currentUser = authenticatedUserResolver.requireAuthenticatedUser();
        return ResponseEntity.ok(agentService.updateProfile(currentUser, request));
    }

    @PostMapping("/quota/replenish")
    @PreAuthorize("hasRole('AGENTE_KIOSKO')")
    public ResponseEntity<ReplenishQuotaResponseDTO> replenishQuota(@RequestBody ReplenishQuotaRequestDTO request) {
        User currentUser = authenticatedUserResolver.requireAuthenticatedUser();
        return ResponseEntity.ok(agentService.replenishQuota(currentUser, request.amount()));
    }

    @GetMapping("/cards/lookup")
    @PreAuthorize("hasRole('AGENTE_KIOSKO')")
    public ResponseEntity<List<AgentCardLookupDTO>> lookupCards(@RequestParam("query") String query) {
        authenticatedUserResolver.requireAuthenticatedUser();
        return ResponseEntity.ok(agentService.lookupCards(query));
    }

    @GetMapping("/cards/inventory")
    @PreAuthorize("hasRole('AGENTE_KIOSKO')")
    public ResponseEntity<List<String>> listInventoryCards() {
        User currentUser = authenticatedUserResolver.requireAuthenticatedUser();
        return ResponseEntity.ok(agentService.listInventoryCards(currentUser));
    }

    @PostMapping("/cards/issue")
    @PreAuthorize("hasRole('AGENTE_KIOSKO')")
    public ResponseEntity<?> issueCard(@RequestBody AgentIssueCardRequestDTO request) {
        User currentUser = authenticatedUserResolver.requireAuthenticatedUser();
        try {
            return ResponseEntity.ok(agentService.issueCardAsAgent(currentUser, request));
        } catch (InvalidDocumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/recharges")
    @PreAuthorize("hasRole('AGENTE_KIOSKO')")
    public ResponseEntity<AgentRechargeResponseDTO> processRecharge(@RequestBody AgentRechargeRequestDTO request) {
        User currentUser = authenticatedUserResolver.requireAuthenticatedUser();
        return ResponseEntity.ok(agentService.processRecharge(currentUser, request));
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasRole('AGENTE_KIOSKO')")
    public ResponseEntity<List<AgentTransactionDTO>> getTransactions(
            @RequestParam(name = "type", required = false) String type) {
        User currentUser = authenticatedUserResolver.requireAuthenticatedUser();
        return ResponseEntity.ok(agentService.getTransactions(currentUser, type));
    }

    @GetMapping("/cash-close")
    @PreAuthorize("hasRole('AGENTE_KIOSKO')")
    public ResponseEntity<AgentCashCloseResponseDTO> getCashClose() {
        User currentUser = authenticatedUserResolver.requireAuthenticatedUser();
        return ResponseEntity.ok(agentService.getCashCloseSummary(currentUser));
    }

    @PostMapping("/cash-close")
    @PreAuthorize("hasRole('AGENTE_KIOSKO')")
    public ResponseEntity<AgentCashCloseResponseDTO.CashClosureRecordDTO> confirmCashClose(
            @RequestBody(required = false) Map<String, String> body) {
        User currentUser = authenticatedUserResolver.requireAuthenticatedUser();
        String notes = body != null ? body.get("notes") : null;
        return ResponseEntity.ok(agentService.confirmCashClose(currentUser, notes));
    }
}
