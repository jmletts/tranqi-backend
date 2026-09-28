package com.tranki.backend.card.adapter.in.web.dto;

import java.util.UUID;

public record IssueCardResponseDTO(
    String cardId,
    UUID accountId,
    String verificationNumber,
    String status
) {}
