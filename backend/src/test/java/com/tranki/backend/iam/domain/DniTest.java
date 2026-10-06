package com.tranki.backend.iam.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class DniTest {

    @Test
    @DisplayName("Debe crear la instancia si el DNI tiene entre 8 y 10 digitos")
    void shouldCreateDniOnValidFormat() {
        Dni dni8 = new Dni("12345678");
        assertEquals("12345678", dni8.getValue());
        
        Dni dni10 = new Dni("1234567890");
        assertEquals("1234567890", dni10.getValue());
    }

    @Test
    @DisplayName("Debe lanzar IllegalArgumentException si el DNI es invalido")
    void shouldThrowExceptionOnInvalidFormat() {
        assertThrows(IllegalArgumentException.class, () -> new Dni("1234567")); // 7 digitos
        assertThrows(IllegalArgumentException.class, () -> new Dni("12345678901")); // 11 digitos
        assertThrows(IllegalArgumentException.class, () -> new Dni("12345ABC")); // contiene letras
        assertThrows(IllegalArgumentException.class, () -> new Dni(null));
    }
}
