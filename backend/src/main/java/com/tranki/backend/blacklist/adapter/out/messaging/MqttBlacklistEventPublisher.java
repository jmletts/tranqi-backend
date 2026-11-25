package com.tranki.backend.blacklist.adapter.out.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tranki.backend.blacklist.application.port.out.BlacklistEventPublisherPort;
import com.tranki.backend.blacklist.domain.BlacklistEntry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.integration.mqtt.outbound.MqttPahoMessageHandler;
import org.springframework.integration.mqtt.core.DefaultMqttPahoClientFactory;
import org.springframework.integration.mqtt.core.MqttPahoClientFactory;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class MqttBlacklistEventPublisher implements BlacklistEventPublisherPort {

    private final ObjectMapper objectMapper;
    
    @Value("${mqtt.broker.host:localhost}")
    private String mqttHost;
    
    @Value("${mqtt.broker.port:1883}")
    private int mqttPort;
    
    @Value("${mqtt.client.id:tranki-backend-node}")
    private String clientId;
    
    @Value("${mqtt.topics.blacklist-urgent:/flota/listanegra/urgente}")
    private String urgentTopic;
    
    private MqttPahoMessageHandler mqttHandler;

    public MqttBlacklistEventPublisher(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }
    
    @PostConstruct
    public void init() {
        MqttPahoClientFactory clientFactory = new DefaultMqttPahoClientFactory();
        String brokerUrl = "tcp://" + mqttHost + ":" + mqttPort;
        
        mqttHandler = new MqttPahoMessageHandler(clientId, clientFactory);
        mqttHandler.setDefaultTopic(urgentTopic);
    }

    @Override
    public void publishUrgentBlock(BlacklistEntry entry) {
        try {
            ObjectNode json = objectMapper.createObjectNode();
            json.put("action", entry.isActive() ? "BLOCK" : "REMOVE");
            json.put("cardId", entry.getCardId());
            if (entry.isActive() && entry.getReason() != null) {
                json.put("reason", entry.getReason().name());
            }
            json.put("version", entry.getVersion());

            String payload = objectMapper.writeValueAsString(json);
            
            Message<String> message = MessageBuilder
                    .withPayload(payload)
                    .build();
            
            mqttHandler.handleMessage(message);
            System.out.println("[MQTT] Published event to " + urgentTopic + ": " + payload);
        } catch (Exception e) {
            System.err.println("[MQTT ERROR] No se pudo publicar el evento en MQTT: " + e.getMessage());
        }
    }

    @Override
    public void publishUrgentUnblock(String cardId, long newVersion) {
        try {
            ObjectNode json = objectMapper.createObjectNode();
            json.put("action", "REMOVE");
            json.put("cardId", cardId);
            json.put("version", newVersion);

            String payload = objectMapper.writeValueAsString(json);
            Message<String> message = MessageBuilder
                    .withPayload(payload)
                    .build();

            mqttHandler.handleMessage(message);
            System.out.println("[MQTT] Published unblock event to " + urgentTopic + ": " + payload);
        } catch (Exception e) {
            System.err.println("[MQTT ERROR] No se pudo publicar el desbloqueo en MQTT: " + e.getMessage());
        }
    }
}
