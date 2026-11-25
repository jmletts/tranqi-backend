package com.tranki.backend.agent.adapter.in.web.dto;

public record AgentIssueCardRequestDTO(
        String cardId,
        String fareCategory,
        String documentNumber,
        String paymentMethod
) {}
