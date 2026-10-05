package com.tranki.backend.blacklist.infrastructure.mqtt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tranki.backend.blacklist.application.SyncBlacklistUseCase;
import com.tranki.backend.blacklist.adapter.in.web.dto.BlacklistSyncResponseDTO;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Subscriber MQTT para debug y monitoreo del canal de Lista Negra.
 *
 * Se suscribe al tópico /flota/listanegra/urgente para que el servidor
 * pueda registrar y confirmar que los mensajes se están enviando correctamente.
 *
 * Flujo:
 *  1. PublishBlacklistUpdateUseCase.blockCard() -> MqttBlacklistEventPublisher.publishUrgentBlock()
 *  2. Mosquitto (broker) -> re-distribuye a todos los suscriptores
 *  3. MqttBlacklistSubscriber.messageArrived() -> log de confirmación en el backend
 *  4. ESP32 (blacklist_sync.h) -> onMqttUrgentEvent() -> bloqueo inmediato en RAM
 */
@Component
public class MqttBlacklistSubscriber implements MqttCallback {

    private static final String TOPIC_URGENT      = "/flota/listanegra/urgente";
    private static final String TOPIC_STATUS       = "/flota/validadores/+/status";

    private final MqttClient mqttClient;
    private final ObjectMapper objectMapper;

    public MqttBlacklistSubscriber(MqttClient mqttClient, ObjectMapper objectMapper) {
        this.mqttClient = mqttClient;
        this.objectMapper = objectMapper;
    }

    /**
     * Suscribirse al arrancar la aplicación Spring Boot.
     * Usa @EventListener(ApplicationReadyEvent) para asegurarse de que el
     * contexto Spring ya está completamente cargado antes de conectar.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void subscribeOnStartup() {
        if (!mqttClient.isConnected()) {
            System.err.println("[MQTT-SUB] Broker no disponible al arrancar. Suscripción diferida.");
            return;
        }

        try {
            mqttClient.setCallback(this);
            mqttClient.subscribe(TOPIC_URGENT, 1);       // QoS 1 para alertas de seguridad
            mqttClient.subscribe(TOPIC_STATUS, 0);       // QoS 0 para heartbeats de validadores
            System.out.println("[MQTT-SUB] Suscrito a tópicos:");
            System.out.println("  -> " + TOPIC_URGENT + " (QoS 1 — alertas urgentes)");
            System.out.println("  -> " + TOPIC_STATUS + " (QoS 0 — estado de validadores)");
        } catch (MqttException e) {
            System.err.println("[MQTT-SUB] Error al suscribirse a tópicos: " + e.getMessage());
        }
    }

    @Override
    public void messageArrived(String topic, MqttMessage message) {
        String payload = new String(message.getPayload());

        if (topic.equals(TOPIC_URGENT)) {
            System.out.println("[MQTT-SUB] Evento urgente recibido en " + topic + ": " + payload);
            // El backend publicó el evento y lo está recibiendo él mismo — confirmación de entrega.
        } else if (topic.startsWith("/flota/validadores/")) {
            // Heartbeat/status de un validador ESP32
            // Ej: /flota/validadores/BUS-201/status
            String busId = topic.split("/")[3];
            System.out.println("[MQTT-SUB] Estado de validador " + busId + ": " + payload);
        }
    }

    @Override
    public void connectionLost(Throwable cause) {
        System.err.println("[MQTT-SUB] Conexión perdida con el broker: " + cause.getMessage());
        System.err.println("[MQTT-SUB] El cliente Paho intentará reconectarse automáticamente...");
        // La reconexión automática está configurada en MqttConfig (setAutomaticReconnect=true)
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
        // Confirmación de entrega de mensajes publicados (solo para QoS > 0)
        System.out.println("[MQTT-SUB] Entrega confirmada. ID de mensaje: " + token.getMessageId());
    }
}
