package com.tranki.backend.card.domain;

import com.tranki.backend.account.domain.FareCategory;

public interface DocumentValidatorPort {
    /**
     * Validates if a document is valid for a specific fare category.
     * @param documentNumber The document to validate
     * @param category The fare category requested
     * @return true if valid, false otherwise
     */
    boolean isValidForCategory(String documentNumber, FareCategory category);
}
