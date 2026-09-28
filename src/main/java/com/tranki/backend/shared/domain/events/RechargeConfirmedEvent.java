package com.tranki.backend.shared.domain.events;

import com.tranki.backend.shared.domain.Money;
import java.util.UUID;

public record RechargeConfirmedEvent(String transactionId, UUID accountId, String cardId, Money amount) {}
