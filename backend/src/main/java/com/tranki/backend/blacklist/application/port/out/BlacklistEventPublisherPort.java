package com.tranki.backend.blacklist.application.port.out;

import com.tranki.backend.blacklist.domain.BlacklistEntry;

public interface BlacklistEventPublisherPort {
    void publishUrgentBlock(BlacklistEntry entry);

    void publishUrgentUnblock(String cardId, long newVersion);
}
