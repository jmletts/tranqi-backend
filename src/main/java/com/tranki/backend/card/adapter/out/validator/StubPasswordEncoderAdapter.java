package com.tranki.backend.card.adapter.out.validator;

import com.tranki.backend.card.domain.PasswordEncoderPort;
import org.springframework.stereotype.Component;

@Component
public class StubPasswordEncoderAdapter implements PasswordEncoderPort {
    @Override
    public boolean matches(String rawPassword, String encodedPassword) {
        if (rawPassword == null || encodedPassword == null) return false;
        // Mock hash logic para los tests: el hash es simplemente HASH_ + rawPassword
        return encodedPassword.equals("HASH_" + rawPassword);
    }
}
