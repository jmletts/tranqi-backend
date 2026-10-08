package com.tranki.backend.shared.domain.events;

public record BlacklistRemovalOrderEvent(String cardId, String reason) {}
