package com.tranki.backend.account.adapter.in.web.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record TransferRequestDTO(UUID originAccountId, UUID destinationAccountId, BigDecimal amount) {}
