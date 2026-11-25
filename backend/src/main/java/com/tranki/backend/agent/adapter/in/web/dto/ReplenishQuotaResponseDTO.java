package com.tranki.backend.agent.adapter.in.web.dto;

import java.math.BigDecimal;

public record ReplenishQuotaResponseDTO(
        BigDecimal operationalBalance,
        AgentTransactionDTO transaction
) {}
