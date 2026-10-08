package com.tranki.backend.card.adapter.in.web.dto;

import java.util.UUID;

public record LinkCardRequestDTO(
    String cardId,
    UUID userId,
    String securityCode
) {}
