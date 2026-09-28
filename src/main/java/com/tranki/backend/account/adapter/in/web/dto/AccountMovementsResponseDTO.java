package com.tranki.backend.account.adapter.in.web.dto;

import com.tranki.backend.account.domain.AccountMovement;
import java.math.BigDecimal;
import java.util.List;

public record AccountMovementsResponseDTO(BigDecimal currentBalance, List<AccountMovement> movements) {}
