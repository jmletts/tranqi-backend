package com.tranki.backend.account.adapter.in.web.dto;

import java.math.BigDecimal;

public record RechargeRequestDTO(String transactionId, String cardId, BigDecimal amount, String origin) {}
