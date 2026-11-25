package com.tranki.backend.account.adapter.in.web.dto;

import java.math.BigDecimal;
import java.util.List;

public record TravelerMovementsResponseDTO(
        BigDecimal totalBalance,
        List<TravelerMovementDTO> movements
) {}
