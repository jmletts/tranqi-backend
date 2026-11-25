package com.tranki.backend.agent.adapter.in.web.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record AgentTransactionDTO(
        UUID id,
        String referenceCode,
        String type,
        String cardId,
        String cardHolder,
        String fareCategory,
        BigDecimal amount,
        BigDecimal previousBalance,
        BigDecimal newBalance,
        String paymentMethod,
        String status,
        boolean unlockedDebt,
        String notes,
        LocalDateTime createdAt
) {}
