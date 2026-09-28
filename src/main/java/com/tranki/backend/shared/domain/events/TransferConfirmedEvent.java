package com.tranki.backend.shared.domain.events;

import com.tranki.backend.shared.domain.Money;
import java.util.UUID;

public record TransferConfirmedEvent(UUID originAccountId, UUID destinationAccountId, Money amount) {}
