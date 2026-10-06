package com.tranki.backend.shared.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

class MoneyTest {

    @Test
    @DisplayName("Debe sumar dos cantidades de dinero correctamente")
    void shouldAddCorrectly() {
        Money amount1 = Money.of("15.50");
        Money amount2 = Money.of("5.25");
        Money result = amount1.add(amount2);
        
        assertEquals(Money.of("20.75"), result);
    }

    @Test
    @DisplayName("Debe restar dos cantidades de dinero correctamente")
    void shouldSubtractCorrectly() {
        Money amount1 = Money.of("20.00");
        Money amount2 = Money.of("5.50");
        Money result = amount1.subtract(amount2);
        
        assertEquals(Money.of("14.50"), result);
    }

    @Test
    @DisplayName("Debe lanzar excepción si el amount es nulo al crear la instancia")
    void shouldThrowExceptionOnNullAmount() {
        assertThrows(NullPointerException.class, () -> new Money((BigDecimal) null));
    }

    @Test
    @DisplayName("Debe comparar correctamente usando isLessThan")
    void shouldCompareCorrectly() {
        Money smaller = Money.of("-5.00");
        Money bigger = Money.of("10.00");
        Money equalBigger = Money.of("10.00");
        
        assertTrue(smaller.isLessThan(bigger));
        assertFalse(bigger.isLessThan(smaller));
        assertFalse(bigger.isLessThan(equalBigger));
    }
}
