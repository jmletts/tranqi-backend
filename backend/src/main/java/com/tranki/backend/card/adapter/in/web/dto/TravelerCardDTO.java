package com.tranki.backend.card.adapter.in.web.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record TravelerCardDTO(
        String cardId,
        UUID accountId,
        String alias,
        String verificationNumber,
        String cardStatus,
        String accountStatus,
        String fareCategory,
        BigDecimal balance,
        BigDecimal debtMarginLimit,
        boolean isDefault
) {}
