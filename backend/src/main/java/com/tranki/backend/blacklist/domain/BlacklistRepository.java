package com.tranki.backend.blacklist.domain;

import java.util.List;

public interface BlacklistRepository {
    List<BlacklistEntry> findAll();
    List<BlacklistEntry> findSinceVersion(long version);
    void save(BlacklistEntry entry);
    void removeByCardId(String cardId);
    long getCurrentGlobalVersion();
    long incrementAndGetGlobalVersion();
}
