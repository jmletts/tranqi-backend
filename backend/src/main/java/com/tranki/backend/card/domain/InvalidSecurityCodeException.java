package com.tranki.backend.card.domain;

public class InvalidSecurityCodeException extends RuntimeException {
    public InvalidSecurityCodeException(String message) {
        super(message);
    }
}
