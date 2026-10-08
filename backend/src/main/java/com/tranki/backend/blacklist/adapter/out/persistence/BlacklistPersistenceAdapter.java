package com.tranki.backend.blacklist.adapter.out.persistence;

import com.tranki.backend.blacklist.domain.BlacklistEntry;
import com.tranki.backend.blacklist.domain.BlacklistRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Component
public class BlacklistPersistenceAdapter implements BlacklistRepository {

    private final BlacklistJpaRepository jpaRepository;
    private final AtomicLong globalVersion = new AtomicLong(0);

    public BlacklistPersistenceAdapter(BlacklistJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<BlacklistEntry> findAll() {
        return jpaRepository.findAll().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<BlacklistEntry> findSinceVersion(long version) {
        return jpaRepository.findByVersionGreaterThan(version).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void save(BlacklistEntry entry) {
        jpaRepository.save(new BlacklistJpaEntity(
                entry.getCardId(), entry.getReason(), entry.getVersion(), entry.isActive(), entry.getTimestamp()
        ));
    }

    @Override
    public void removeByCardId(String cardId) {
        jpaRepository.deleteById(cardId);
    }

    @Override
    public long getCurrentGlobalVersion() {
        return globalVersion.get();
    }

    @Override
    public long incrementAndGetGlobalVersion() {
        return globalVersion.incrementAndGet();
    }

    private BlacklistEntry toDomain(BlacklistJpaEntity entity) {
        return new BlacklistEntry(
                entity.getCardId(),
                entity.getReason(),
                entity.getVersion(),
                entity.isActive(),
                entity.getTimestamp()
        );
    }
}
