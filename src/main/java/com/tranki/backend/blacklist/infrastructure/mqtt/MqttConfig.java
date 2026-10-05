package com.tranki.backend.blacklist.infrastructure.mqtt;

import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración MQTT con Eclipse Paho.
 * El broker Mosquitto corre en Docker en el mismo docker-compose.yml del proyecto.
 * Usar tcp://mosquitto:1883 en Docker o tcp://localhost:1883 en desarrollo local.
 */
@Configuration
public class MqttConfig {

    @Value("${tranki.mqtt.broker:tcp://localhost:1883}")
    private String brokerUrl;

    @Value("${tranki.mqtt.client-id:tranki-backend-publisher}")
    private String clientId;

    @Value("${tranki.mqtt.username:}")
    private String username;

    @Value("${tranki.mqtt.password:}")
    private String password;

    @Bean
    public MqttClient mqttClient() throws MqttException {
        MqttClient client = new MqttClient(brokerUrl, clientId, new MemoryPersistence());

        MqttConnectOptions options = new MqttConnectOptions();
        options.setAutomaticReconnect(true);  // Reconexión automática si el broker cae
        options.setCleanSession(true);
        options.setConnectionTimeout(10);
        options.setKeepAliveInterval(30);

        if (!username.isBlank()) {
            options.setUserName(username);
            options.setPassword(password.toCharArray());
        }

        try {
            client.connect(options);
            System.out.println("[MQTT] Conectado al broker: " + brokerUrl);
        } catch (MqttException e) {
            // No fallar el arranque del backend si el broker no está disponible
            System.err.println("[MQTT] Advertencia: No se pudo conectar al broker en " + brokerUrl + ": " + e.getMessage());
            System.err.println("[MQTT] El sistema arrancará igualmente. El MqttClient se reconectará cuando el broker esté disponible.");
        }

        return client;
    }
}
