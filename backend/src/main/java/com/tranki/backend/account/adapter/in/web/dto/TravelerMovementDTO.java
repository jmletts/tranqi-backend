package com.tranki.backend.account.adapter.in.web.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record TravelerMovementDTO(
        String identifier,
        UUID accountId,
        String cardId,
        String cardAlias,
        String fareCategory,
        String type,
        BigDecimal amount,
        LocalDateTime date,
        String detail
) {}
