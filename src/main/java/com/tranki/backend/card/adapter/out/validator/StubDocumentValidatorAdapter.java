package com.tranki.backend.card.adapter.out.validator;

import com.tranki.backend.account.domain.FareCategory;
import com.tranki.backend.card.domain.DocumentValidatorPort;
import org.springframework.stereotype.Component;

@Component
public class StubDocumentValidatorAdapter implements DocumentValidatorPort {
    @Override
    public boolean isValidForCategory(String documentNumber, FareCategory category) {
        if (documentNumber == null || documentNumber.isBlank()) {
            return false;
        }
        String upperDoc = documentNumber.toUpperCase();
        if (upperDoc.contains("VENCIDO") || upperDoc.contains("INVALIDO")) {
            return false;
        }
        return true;
    }
}
