package com.tranki.backend.blacklist.adapter.out.persistence;

import com.tranki.backend.blacklist.domain.BlockReason;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "blacklist_entries")
public class BlacklistJpaEntity {
    @Id
    private String cardId;
    
    @Enumerated(EnumType.STRING)
    private BlockReason reason;
    
    private long version;
    private boolean active;
    private Instant timestamp;

    public BlacklistJpaEntity() {}

    public BlacklistJpaEntity(String cardId, BlockReason reason, long version, boolean active, Instant timestamp) {
        this.cardId = cardId;
        this.reason = reason;
        this.version = version;
        this.active = active;
        this.timestamp = timestamp;
    }

    public String getCardId() { return cardId; }
    public BlockReason getReason() { return reason; }
    public long getVersion() { return version; }
    public boolean isActive() { return active; }
    public Instant getTimestamp() { return timestamp; }
}
