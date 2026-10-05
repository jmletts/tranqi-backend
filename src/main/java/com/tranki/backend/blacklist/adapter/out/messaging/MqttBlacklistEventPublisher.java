package com.tranki.backend.blacklist.adapter.out.messaging;

import com.tranki.backend.blacklist.application.port.out.BlacklistEventPublisherPort;
import com.tranki.backend.blacklist.domain.BlacklistEntry;
import org.springframework.stereotype.Component;

@Component
public class MqttBlacklistEventPublisher implements BlacklistEventPublisherPort {

    @Override
    public void publishUrgentBlock(BlacklistEntry entry) {
        System.out.println("Publishing urgent MQTT message to /flota/listanegra/urgente: BLOCK " + entry.getCardId());
    }
}
