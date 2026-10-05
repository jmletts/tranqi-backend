package com.tranki.backend.blacklist.adapter.in.web.dto;

public record BlacklistSyncResponseDTO(
        long newVersion,
        boolean isFullSnapshot,
        byte[] cuckooFilter,
        BlacklistDeltaDTO changes
) {}
