package com.tranki.backend.shared.domain.events;

import java.util.UUID;

public record TransferRejectedByDebtLimitEvent(UUID accountId) {}
