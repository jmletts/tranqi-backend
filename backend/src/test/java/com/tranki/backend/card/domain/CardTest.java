package com.tranki.backend.card.domain;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

class CardTest {

    private Card card;
    private PasswordEncoderPort encoderMock;

    @BeforeEach
    void setUp() {
        card = new Card("CARD-123", UUID.randomUUID(), CardStatus.ACTIVE, "1234", "hash-1234", UUID.randomUUID());
        
        encoderMock = new PasswordEncoderPort() {
            @Override
            public boolean matches(String rawPassword, String encodedPassword) {
                return ("hash-" + rawPassword).equals(encodedPassword);
            }
        };
    }

    @Test
    @DisplayName("Debe validar exitosamente cuando el código es correcto y reiniciar los intentos fallidos")
    void shouldValidateCorrectly() {
        Card cardWithAttempts = new Card("CARD-123", UUID.randomUUID(), CardStatus.ACTIVE, "1234", "hash-1234", UUID.randomUUID(), 3);
        cardWithAttempts.validateAndRegisterLinkAttempt("1234", encoderMock);
        assertEquals(0, cardWithAttempts.getFailedLinkAttempts(), "Los intentos fallidos deben reiniciarse a cero");
    }

    @Test
    @DisplayName("Debe registrar intento fallido y lanzar InvalidSecurityCodeException cuando el código es incorrecto")
    void shouldThrowInvalidSecurityCodeOnWrongCode() {
        assertThrows(InvalidSecurityCodeException.class, () -> card.validateAndRegisterLinkAttempt("9999", encoderMock));
        assertEquals(1, card.getFailedLinkAttempts(), "Debería haber sumado 1 intento fallido");
    }

    @Test
    @DisplayName("Debe lanzar MaxLinkAttemptsExceededException cuando se superan los 5 intentos fallidos")
    void shouldThrowMaxAttemptsExceededOnMultipleFailures() {
        for (int i = 0; i < 4; i++) {
            assertThrows(InvalidSecurityCodeException.class, () -> card.validateAndRegisterLinkAttempt("9999", encoderMock));
        }
        assertThrows(MaxLinkAttemptsExceededException.class, () -> card.validateAndRegisterLinkAttempt("9999", encoderMock));
        assertThrows(MaxLinkAttemptsExceededException.class, () -> card.validateAndRegisterLinkAttempt("1234", encoderMock));
    }

    @Test
    @DisplayName("Debe cambiar el estado a BLOCKED_DEBT al bloquear por deuda")
    void shouldBlockByDebt() {
        card.blockByDebt();
        assertEquals(CardStatus.BLOCKED_DEBT, card.getCardStatus(), "El estado debe ser BLOCKED_DEBT");
    }

    @Test
    @DisplayName("Debe regresar a ACTIVE al desbloquear de deuda")
    void shouldUnlockFromDebt() {
        card.blockByDebt();
        card.unlockFromDebt();
        assertEquals(CardStatus.ACTIVE, card.getCardStatus(), "El estado debe volver a ACTIVE");
    }
}
