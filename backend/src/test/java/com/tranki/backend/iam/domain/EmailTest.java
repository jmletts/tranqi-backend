package com.tranki.backend.iam.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class EmailTest {

    @Test
    @DisplayName("Debe crear la instancia si el correo tiene formato valido")
    void shouldCreateEmailOnValidFormat() {
        Email email = new Email("test@tranki.com");
        assertEquals("test@tranki.com", email.getValue());
    }

    @Test
    @DisplayName("Debe lanzar IllegalArgumentException si el correo tiene formato invalido")
    void shouldThrowExceptionOnInvalidFormat() {
        assertThrows(IllegalArgumentException.class, () -> new Email("correo-invalido"));
        assertThrows(IllegalArgumentException.class, () -> new Email("@dominio.com"));
        assertThrows(IllegalArgumentException.class, () -> new Email("usuario@.com"));
        assertThrows(IllegalArgumentException.class, () -> new Email(null));
    }
}
