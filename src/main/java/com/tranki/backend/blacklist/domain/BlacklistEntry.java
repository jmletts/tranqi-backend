package com.tranki.backend.blacklist.domain;

import java.time.Instant;

public class BlacklistEntry {
    private final String cardId;
    private final BlockReason reason;
    private final long version;
    private final boolean active;
    private final Instant timestamp;

    public BlacklistEntry(String cardId, BlockReason reason, long version, boolean active, Instant timestamp) {
        this.cardId = cardId;
        this.reason = reason;
        this.version = version;
        this.active = active;
        this.timestamp = timestamp;
    }

    public String getCardId() {
        return cardId;
    }

    public BlockReason getReason() {
        return reason;
    }

    public long getVersion() {
        return version;
    }

    public boolean isActive() {
        return active;
    }

    public Instant getTimestamp() {
        return timestamp;
    }
}
