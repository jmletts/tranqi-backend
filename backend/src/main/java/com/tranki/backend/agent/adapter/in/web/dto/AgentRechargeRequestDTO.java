package com.tranki.backend.agent.adapter.in.web.dto;

import java.math.BigDecimal;

public record AgentRechargeRequestDTO(
        String cardId,
        BigDecimal amount,
        String paymentMethod
) {}
