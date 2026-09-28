package com.tranki.backend.card.adapter.in.web.dto;

import java.util.UUID;

public record ChangeFareCategoryRequestDTO(
    UUID accountId,
    String fareCategory,
    String documentNumber,
    UUID kioskAgentId
) {}
