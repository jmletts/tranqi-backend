package com.tranki.backend.blacklist.application;

import com.tranki.backend.shared.domain.events.BlacklistRemovalOrderEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class BlacklistRemovalEventHandler {

    private final PublishBlacklistUpdateUseCase publishBlacklistUpdateUseCase;

    public BlacklistRemovalEventHandler(PublishBlacklistUpdateUseCase publishBlacklistUpdateUseCase) {
        this.publishBlacklistUpdateUseCase = publishBlacklistUpdateUseCase;
    }

    @EventListener
    public void onBlacklistRemovalOrder(BlacklistRemovalOrderEvent event) {
        if (event.cardId() != null && !event.cardId().isBlank()) {
            publishBlacklistUpdateUseCase.removeBlock(event.cardId());
        }
    }
}
