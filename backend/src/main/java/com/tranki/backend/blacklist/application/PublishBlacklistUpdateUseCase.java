package com.tranki.backend.blacklist.application;

import com.tranki.backend.blacklist.application.port.out.BlacklistEventPublisherPort;
import com.tranki.backend.blacklist.domain.BlacklistEntry;
import com.tranki.backend.blacklist.domain.BlacklistRepository;
import com.tranki.backend.blacklist.domain.BlockReason;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class PublishBlacklistUpdateUseCase {

    private final BlacklistRepository repository;
    private final BlacklistEventPublisherPort eventPublisher;

    public PublishBlacklistUpdateUseCase(BlacklistRepository repository, BlacklistEventPublisherPort eventPublisher) {
        this.repository = repository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    @CacheEvict(value = "blacklist", allEntries = true)
    public void blockCard(String cardId, BlockReason reason) {
        long newVersion = repository.incrementAndGetGlobalVersion();
        BlacklistEntry entry = new BlacklistEntry(cardId, reason, newVersion, true, Instant.now());
        repository.save(entry);

        if (reason == BlockReason.FRAUD || reason == BlockReason.LOST_STOLEN) {
            eventPublisher.publishUrgentBlock(entry);
        }
    }

    @Transactional
    @CacheEvict(value = "blacklist", allEntries = true)
    public void removeBlock(String cardId) {
        long newVersion = repository.incrementAndGetGlobalVersion();
        BlacklistEntry entry = new BlacklistEntry(cardId, null, newVersion, false, Instant.now());
        repository.save(entry);
    }
}
