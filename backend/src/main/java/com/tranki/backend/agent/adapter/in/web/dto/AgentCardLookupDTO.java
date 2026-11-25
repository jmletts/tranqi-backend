package com.tranki.backend.agent.adapter.in.web.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record AgentCardLookupDTO(
        String cardId,
        UUID accountId,
        String verificationNumber,
        String holderName,
        String holderDni,
        String fareCategory,
        BigDecimal balance,
        String cardStatus
) {}
