package com.tranki.backend.shared.domain.events;

public record RechargeRejectedAccountNotFoundEvent(String transactionId, String cardId) {}
