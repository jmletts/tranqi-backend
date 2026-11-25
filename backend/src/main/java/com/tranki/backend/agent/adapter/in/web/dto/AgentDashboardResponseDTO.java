package com.tranki.backend.agent.adapter.in.web.dto;

import java.math.BigDecimal;
import java.util.List;

public record AgentDashboardResponseDTO(
        AgentProfileDTO agentProfile,
        BigDecimal operationalBalance,
        BigDecimal commissionRate,
        BigDecimal todayTotalRecharged,
        int todayTransactionsCount,
        BigDecimal estimatedCommission,
        List<AgentTransactionDTO> recentTransactions
) {}
