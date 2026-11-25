package com.tranki.backend.card.adapter.in.web.dto;

public record LinkMyCardRequestDTO(
        String cardIdentifier,
        String securityCode,
        String alias
) {}
