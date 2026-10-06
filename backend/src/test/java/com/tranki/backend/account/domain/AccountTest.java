package com.tranki.backend.account.domain;

import com.tranki.backend.shared.domain.Money;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

class AccountTest {

    private Account account;

    @BeforeEach
    void setUp() {
        account = Account.createAnonymous(UUID.randomUUID(), FareCategory.GENERAL, Money.of("10.00"));
    }

    @Test
    @DisplayName("Debe sumar el saldo correctamente al recargar")
    void shouldAddBalanceCorrectly() {
        account.addBalance(Money.of("5.00"));
        assertEquals(Money.of("15.00"), account.getBalance(), "El saldo debería ser 15.00");
    }

    @Test
    @DisplayName("Debe lanzar excepción si se intenta recargar un monto cero o negativo")
    void shouldThrowExceptionWhenAddingNegativeOrZeroBalance() {
        assertThrows(IllegalArgumentException.class, () -> account.addBalance(Money.of("0.00")));
        assertThrows(IllegalArgumentException.class, () -> account.addBalance(Money.of("-1.00")));
    }

    @Test
    @DisplayName("Debe restar el saldo correctamente sin superar el margen de deuda")
    void shouldSubtractBalanceCorrectly() {
        account.subtractBalance(Money.of("12.00"));
        assertEquals(Money.of("-2.00"), account.getBalance(), "El saldo debería ser -2.00");
    }

    @Test
    @DisplayName("Debe lanzar excepción si la resta supera el margen de deuda")
    void shouldThrowExceptionWhenSubtractingMoreThanDebtMarginLimit() {
        assertThrows(IllegalStateException.class, () -> account.subtractBalance(Money.of("14.00")));
    }

    @Test
    @DisplayName("Debe permitir forzar la resta de saldo incluso superando el margen de deuda")
    void shouldAllowForceSubtractBalanceEvenIfExceedsDebtMargin() {
        account.forceSubtractBalance(Money.of("20.00"));
        assertEquals(Money.of("-10.00"), account.getBalance(), "El saldo debería permitir sobregiro forzado a -10.00");
    }
}
