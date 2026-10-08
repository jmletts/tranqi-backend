package com.tranki.backend.card.domain;

public class CardAlreadyLinkedException extends RuntimeException {
    public CardAlreadyLinkedException(String message) {
        super(message);
    }
}
