package com.tranki.backend.shared.domain;

import java.math.BigDecimal;
import java.util.Objects;

public record Money(BigDecimal amount) {
    public Money {
        Objects.requireNonNull(amount, "Amount cannot be null");
    }

    public static Money of(String val) {
        return new Money(new BigDecimal(val));
    }

    public static Money of(double val) {
        return new Money(BigDecimal.valueOf(val));
    }

    public Money add(Money other) {
        return new Money(this.amount.add(other.amount));
    }

    public Money subtract(Money other) {
        return new Money(this.amount.subtract(other.amount));
    }

    public boolean isLessThan(Money other) {
        return this.amount.compareTo(other.amount) < 0;
    }
}
