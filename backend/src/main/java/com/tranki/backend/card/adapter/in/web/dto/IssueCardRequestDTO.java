package com.tranki.backend.card.adapter.in.web.dto;

import java.util.UUID;

public record IssueCardRequestDTO(
    String cardId,
    String fareCategory,
    String documentNumber,
    UUID kioskAgentId
) {}
