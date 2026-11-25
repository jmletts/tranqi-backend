package com.tranki.backend.agent.adapter.in.web.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record AgentIssueCardResponseDTO(
        String cardId,
        UUID accountId,
        String verificationNumber,
        String securityCode,
        String fareCategory,
        BigDecimal initialBalance,
        String status,
        AgentTransactionDTO transaction
) {}
