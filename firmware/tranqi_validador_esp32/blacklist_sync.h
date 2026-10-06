/**
 * ============================================================================
 * TRANQI TRANSIT - VALIDADOR EMBEBIDO ESP32
 * Archivo: blacklist_sync.h
 * Descripción: Módulo de sincronización dual de la Lista Negra (US-11)
 *
 * Implementa los 3 mecanismos de actualización definidos por el backend:
 *
 *  A. HTTP Polling periódico  -> GET /api/v1/blacklist/sync?localVersion=N
 *       - Respuesta isFullSnapshot=true -> Full Snapshot (lista plana JSON)
 *       - Respuesta isFullSnapshot=false -> Delta {add:[...], remove:[...]}
 *       - Si localVersion == newVersion -> sin cambios (sin-operación)
 *       - Rate Limit del backend: máximo 60 req/min (responde 429 si se excede)
 *
 *  B. MQTT Push urgente       -> Tópico /flota/listanegra/urgente
 *       - Solo para FRAUD y LOST_STOLEN (motivos críticos)
 *       - Bloqueo inmediato en RAM sin esperar polling
 *
 * JSON de respuesta delta esperado del backend (BlacklistSyncResponseDTO):
 * {
 *   "newVersion": 105,
 *   "isFullSnapshot": false,
 *   "cuckooFilter": null,          <- null en deltas, bytes[] en full snapshot
 *   "changes": {
 *     "add": ["TRK-9002", "TRK-9003"],
 *     "remove": ["TRK-9001"]
 *   }
 * }
 *
 * JSON de respuesta Full Snapshot (localVersion=0 o muy desfasada):
 * {
 *   "newVersion": 105,
 *   "isFullSnapshot": true,
 *   "cuckooFilter": [1,2,3,4],     <- Mock bytes del backend (pendiente implementación real)
 *   "changes": null
 * }
 *
 * JSON de evento MQTT urgente (/flota/listanegra/urgente):
 * { "action": "BLOCK", "cardId": "TRK-5001", "reason": "FRAUD", "version": 106 }
 * ============================================================================
 */

#ifndef TRANQI_BLACKLIST_SYNC_H
#define TRANQI_BLACKLIST_SYNC_H

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "config.h"
#include "blacklist_manager.h"

class BlacklistSync {
private:
    BlacklistManager& blacklistMgr;
    unsigned long lastPollMs = 0;
    const unsigned long POLL_INTERVAL_MS = 60000UL; // 60 segundos entre polls (US-11)

    // Tópico MQTT de eventos urgentes (solo referencia — PubSubClient la usará)
    static constexpr const char* MQTT_TOPIC_URGENT = "/flota/listanegra/urgente";

public:
    explicit BlacklistSync(BlacklistManager& mgr) : blacklistMgr(mgr) {}

    void begin() {
        Serial.printf("[BL-SYNC] Sincronización de Lista Negra US-11 activa.\n");
        Serial.printf("[BL-SYNC] Poll HTTP cada %lu segundos -> %s%s\n",
                      POLL_INTERVAL_MS / 1000, BACKEND_BASE_URL, BLACKLIST_SYNC_ENDPOINT);
        Serial.printf("[BL-SYNC] Tópico MQTT urgente: %s\n", MQTT_TOPIC_URGENT);
        // Forzar un sync inicial al arrancar si hay Wi-Fi
        lastPollMs = 0;
    }

    // Llamar en el loop() del sketch principal
    void tick() {
        if (WiFi.status() != WL_CONNECTED) return;
        if (millis() - lastPollMs < POLL_INTERVAL_MS) return;

        lastPollMs = millis();
        pollBackend();
    }

    // Forzar poll inmediato desde la consola (comando SYNCBL)
    void forceSync() {
        if (WiFi.status() != WL_CONNECTED) {
            Serial.println("[BL-SYNC] No hay Wi-Fi. Sync abortado.");
            return;
        }
        pollBackend();
    }

    // -------------------------------------------------------------------------
    // MODO A: HTTP Polling -> GET /api/v1/blacklist/sync?localVersion=N
    // -------------------------------------------------------------------------
    void pollBackend() {
        HTTPClient http;
        String url = String(BACKEND_BASE_URL) + BLACKLIST_SYNC_ENDPOINT
                     + "?localVersion=" + String(blacklistMgr.getLocalVersion());

        http.begin(url);
        http.setTimeout(8000);
        int httpCode = http.GET();

        if (httpCode == 429) {
            // Rate limit del backend (Bucket4j: max 60 req/min)
            Serial.println("[BL-SYNC] Respuesta 429 Too Many Requests. Esperar al próximo ciclo.");
            http.end();
            return;
        }

        if (httpCode != 200) {
            Serial.printf("[BL-SYNC] Error HTTP en sync: %d\n", httpCode);
            http.end();
            return;
        }

        String body = http.getString();
        http.end();

        Serial.printf("[BL-SYNC] Respuesta recibida (%d bytes). Procesando...\n", body.length());
        parseAndApplySyncResponse(body);
    }

    // -------------------------------------------------------------------------
    // Parsear el JSON BlacklistSyncResponseDTO y aplicar al BlacklistManager
    // -------------------------------------------------------------------------
    void parseAndApplySyncResponse(const String& json) {
        DynamicJsonDocument doc(8192);
        DeserializationError err = deserializeJson(doc, json);
        if (err) {
            Serial.printf("[BL-SYNC] Error parseando JSON: %s\n", err.c_str());
            return;
        }

        long newVersion = doc["newVersion"] | 0L;
        bool isFullSnapshot = doc["isFullSnapshot"] | false;

        // Sin cambios si la versión ya es la misma
        if (newVersion == blacklistMgr.getLocalVersion() && !isFullSnapshot) {
            Serial.println("[BL-SYNC] Sin cambios. Lista Negra ya está al día.");
            return;
        }

        if (isFullSnapshot) {
            // ---- MODO A-1: Full Snapshot -----------------------------------
            // Por ahora el backend manda mock bytes en cuckooFilter.
            // Cuando el backend genere un snapshot JSON real de IDs, lo parseamos así:
            Serial.println("[BL-SYNC] Full Snapshot recibido. Reconstruyendo lista negra desde cero...");

            // Intentar leer un array de tarjetas desde "cards" (Plan B del backend)
            // Si el backend incluye un objeto `cards: [{cardId, reason}, ...]` en el snapshot
            JsonArray cards = doc["cards"].as<JsonArray>();
            if (!cards.isNull() && cards.size() > 0) {
                int n = cards.size();
                String cardIds[MAX_BLACKLIST_ENTRIES];
                String reasons[MAX_BLACKLIST_ENTRIES];
                int parsed = 0;
                for (JsonObject c : cards) {
                    if (parsed >= MAX_BLACKLIST_ENTRIES) break;
                    cardIds[parsed] = c["cardId"].as<String>();
                    reasons[parsed] = c["reason"] | "DEBT";
                    parsed++;
                }
                blacklistMgr.applyFullSnapshotList(cardIds, parsed, reasons, newVersion);
            } else {
                // El backend aún manda mock bytes (cuckooFilter = [1,2,3,4])
                // En este caso solo actualizamos la versión para no volver a pedir snapshot
                Serial.println("[BL-SYNC] Full Snapshot binario recibido (modo mock). Versión actualizada.");
                // Nota: cuando el backend implemente el Cuckoo Filter real, parsear bytes aquí.
                // Por ahora, adoptamos la versión para no reciclar innecesariamente.
                blacklistMgr.applyFullSnapshotList(nullptr, 0, nullptr, newVersion);
            }
        } else {
            // ---- MODO A-2: Delta Incremental ------------------------------
            JsonObject changes = doc["changes"];
            if (changes.isNull()) {
                Serial.println("[BL-SYNC] Delta vacío (sin cambios). Versión actualizada.");
                blacklistMgr.applyDelta(nullptr, 0, nullptr, 0, newVersion);
                return;
            }

            JsonArray addArr    = changes["add"].as<JsonArray>();
            JsonArray removeArr = changes["remove"].as<JsonArray>();

            int addCount = 0, removeCount = 0;
            String addIds[MAX_BLACKLIST_ENTRIES];
            String removeIds[MAX_BLACKLIST_ENTRIES];

            for (const String& id : addArr) {
                if (addCount >= MAX_BLACKLIST_ENTRIES) break;
                addIds[addCount++] = id;
            }
            for (const String& id : removeArr) {
                if (removeCount >= MAX_BLACKLIST_ENTRIES) break;
                removeIds[removeCount++] = id;
            }

            blacklistMgr.applyDelta(addIds, addCount, removeIds, removeCount, newVersion);
        }
    }

    // -------------------------------------------------------------------------
    // MODO B: Procesar evento MQTT urgente ya parseado desde el loop MQTT
    // El sketch principal lo invocará cuando llegue un mensaje en el tópico.
    // Payload MQTT esperado:
    //   {"action":"BLOCK","cardId":"TRK-5001","reason":"FRAUD","version":106}
    // -------------------------------------------------------------------------
    void onMqttUrgentEvent(const String& mqttPayload) {
        Serial.printf("[BL-SYNC][MQTT] Evento urgente recibido: %s\n", mqttPayload.c_str());

        DynamicJsonDocument doc(512);
        DeserializationError err = deserializeJson(doc, mqttPayload);
        if (err) {
            Serial.printf("[BL-SYNC][MQTT] Error parseando payload MQTT: %s\n", err.c_str());
            return;
        }

        String action  = doc["action"]  | "";
        String cardId  = doc["cardId"]  | "";
        String reason  = doc["reason"]  | "FRAUD";
        long version   = doc["version"] | (blacklistMgr.getLocalVersion() + 1);

        if (action == "BLOCK" && cardId.length() > 0) {
            blacklistMgr.applyUrgentBlock(cardId, reason, version);
        } else if (action == "REMOVE" && cardId.length() > 0) {
            blacklistMgr.removeCard(cardId);
            Serial.printf("[BL-SYNC][MQTT] REMOVE urgente aplicado: %s\n", cardId.c_str());
        } else {
            Serial.printf("[BL-SYNC][MQTT] Acción MQTT desconocida: '%s'\n", action.c_str());
        }
    }

    const char* getMqttTopic() const {
        return MQTT_TOPIC_URGENT;
    }
};

#endif // TRANQI_BLACKLIST_SYNC_H
