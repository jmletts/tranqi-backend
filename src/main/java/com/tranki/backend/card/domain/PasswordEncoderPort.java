package com.tranki.backend.card.domain;

public interface PasswordEncoderPort {
    boolean matches(String rawPassword, String encodedPassword);
}
