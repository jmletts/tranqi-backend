package com.tranki.backend.shared.domain.events;

import java.util.UUID;

public record TransferRejectedByUnauthorizedAccountEvent(UUID accountId, UUID executingUserId) {}
