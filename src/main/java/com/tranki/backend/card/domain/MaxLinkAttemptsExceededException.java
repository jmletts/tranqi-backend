package com.tranki.backend.card.domain;

public class MaxLinkAttemptsExceededException extends RuntimeException {
    public MaxLinkAttemptsExceededException(String message) {
        super(message);
    }
}
