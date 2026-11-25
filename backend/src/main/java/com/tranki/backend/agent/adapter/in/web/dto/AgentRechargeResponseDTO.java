package com.tranki.backend.agent.adapter.in.web.dto;

import java.math.BigDecimal;

public record AgentRechargeResponseDTO(
        AgentTransactionDTO transaction,
        AgentCardLookupDTO updatedCard,
        BigDecimal updatedAgentBalance
) {}
