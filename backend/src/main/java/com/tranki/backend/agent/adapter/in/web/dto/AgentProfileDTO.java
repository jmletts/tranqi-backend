package com.tranki.backend.agent.adapter.in.web.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AgentProfileDTO(
        String agentCode,
        String businessName,
        String businessAddress,
        BigDecimal operationalBalance,
        BigDecimal commissionRate,
        String status,
        LocalDateTime registeredAt
) {}
