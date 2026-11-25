package com.tranki.backend.agent.adapter.in.web.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record AgentCashCloseResponseDTO(
        String agentCode,
        String businessName,
        LocalDateTime generatedAt,
        BigDecimal operationalBalance,
        BigDecimal commissionRate,
        BigDecimal totalCollected,
        BigDecimal totalRecharged,
        BigDecimal cashTotal,
        int cashCount,
        BigDecimal digitalTotal,
        int digitalCount,
        BigDecimal cardIssuesTotal,
        int cardIssuesCount,
        BigDecimal replenishmentsTotal,
        int replenishmentsCount,
        int rechargesCount,
        int rejectedCount,
        BigDecimal estimatedCommission,
        BigDecimal netToSettle,
        List<AgentTransactionDTO> todayTransactions,
        List<CashClosureRecordDTO> recentClosures
) {
    public record CashClosureRecordDTO(
            UUID id,
            LocalDateTime closedAt,
            BigDecimal totalRecharged,
            BigDecimal cashTotal,
            BigDecimal digitalTotal,
            BigDecimal cardIssuesTotal,
            int transactionsCount,
            BigDecimal estimatedCommission,
            BigDecimal operationalBalanceSnapshot,
            String notes
    ) {}
}
