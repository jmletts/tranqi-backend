package com.tranki.backend.blacklist.adapter.out.messaging;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tranki.backend.blacklist.application.port.out.BlacklistEventPublisherPort;
import com.tranki.backend.blacklist.domain.BlacklistEntry;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Adaptador de salida real para publicar eventos urgentes de Lista Negra por MQTT.
 *
 * Reemplaza el stub anterior (solo println). Ahora publica en el tópico
 * /flota/listanegra/urgente con QoS 1 (at-least-once) para garantizar entrega.
 *
 * Los ESP32 suscritos al tópico recibirán el JSON:
 *   {"action":"BLOCK","cardId":"TRK-5001","reason":"FRAUD","version":106}
 *
 * Activado únicamente para BlockReason.FRAUD y BlockReason.LOST_STOLEN
 * (alta prioridad — desde PublishBlacklistUpdateUseCase).
 */
@Component
public class MqttBlacklistEventPublisher implements BlacklistEventPublisherPort {

    private static final String TOPIC_URGENT = "/flota/listanegra/urgente";

    // QoS 1 = at-least-once. Apropiado para alertas de seguridad donde
    // duplicados son inocuos (idempotencia garantizada en el ESP32).
    private static final int QOS_AT_LEAST_ONCE = 1;

    private final MqttClient mqttClient;
    private final ObjectMapper objectMapper;

    @Value("${tranki.mqtt.broker:tcp://localhost:1883}")
    private String brokerUrl;

    public MqttBlacklistEventPublisher(MqttClient mqttClient, ObjectMapper objectMapper) {
        this.mqttClient = mqttClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public void publishUrgentBlock(BlacklistEntry entry) {
        if (!mqttClient.isConnected()) {
            // Si el broker no está disponible, loguear y continuar — no bloquear la transacción
            System.err.println("[MQTT] Broker no disponible. Evento BLOCK no publicado para: " + entry.getCardId()
                    + " (se aplicará en el próximo polling HTTP del validador)");
            return;
        }

        try {
            // Construir el payload JSON que el ESP32 espera en blacklist_sync.h::onMqttUrgentEvent()
            Map<String, Object> payload = Map.of(
                    "action",  "BLOCK",
                    "cardId",  entry.getCardId(),
                    "reason",  entry.getReason() != null ? entry.getReason().name() : "FRAUD",
                    "version", entry.getVersion()
            );

            String jsonPayload = objectMapper.writeValueAsString(payload);
            MqttMessage message = new MqttMessage(jsonPayload.getBytes("UTF-8"));
            message.setQos(QOS_AT_LEAST_ONCE);
            message.setRetained(false);

            mqttClient.publish(TOPIC_URGENT, message);

            System.out.println("[MQTT] Evento urgente publicado en " + TOPIC_URGENT + ": " + jsonPayload);

        } catch (JsonProcessingException e) {
            System.err.println("[MQTT] Error serializando payload JSON: " + e.getMessage());
        } catch (java.io.UnsupportedEncodingException e) {
            System.err.println("[MQTT] Error codificando UTF-8: " + e.getMessage());
        } catch (MqttException e) {
            System.err.println("[MQTT] Error publicando en broker: " + e.getMessage());
        }
    }
}
