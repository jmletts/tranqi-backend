package com.tranki.backend.account.domain;

import com.tranki.backend.shared.domain.Money;
import java.time.LocalDateTime;

public record AccountMovement(String type, String identifier, Money amount, LocalDateTime date, String detail) {}
