package com.tranki.backend.shared.domain.events;

import java.util.UUID;

public record AccountUnlockedByRechargeEvent(UUID accountId, String cardId) {}
