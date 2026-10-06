package com.tranki.backend.blacklist.adapter.in.web.dto;

import java.util.List;

public record BlacklistSyncResponseDTO(
        long newVersion,
        boolean isFullSnapshot,
        byte[] cuckooFilter,
        List<BlacklistCardDTO> cards,
        BlacklistDeltaDTO changes
) {}
