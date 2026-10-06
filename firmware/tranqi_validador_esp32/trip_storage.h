/**
 * ============================================================================
 * TRANQI TRANSIT - VALIDADOR EMBEBIDO ESP32
 * Archivo: trip_storage.h
 * Descripción: Almacenamiento local persistente y sincronización de lotes (US-08, US-09, US-10)
 * Genera payloads JSON conformes con TripBatchRequestDTO para Spring Boot
 * ============================================================================
 */

#ifndef TRANQI_TRIP_STORAGE_H
#define TRANQI_TRIP_STORAGE_H

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "config.h"

struct TripRecord {
    String tripId;
    String cardId;
    float fare;
    String localTimestamp;
    bool wasDebtTrip;
    float remainingBalance;
};

class TripStorage {
private:
    TripRecord pendingTrips[MAX_PENDING_TRIPS];
    int count = 0;
    unsigned long tripSequence = 1000;

public:
    TripStorage() {}

    void begin() {
        Serial.println("[STORAGE] Sistema de almacenamiento de viajes locales iniciado.");
    }

    // US-09: Encolar registro de abordaje local
    bool recordTrip(const String& cardId, float fare, bool wasDebtTrip, float remainingBalance, String timestamp = "") {
        if (count >= MAX_PENDING_TRIPS) {
            Serial.println("[STORAGE] Alerta: Cola de viajes llena. Descartando el más antiguo...");
            // Desplazar para dar espacio
            for (int i = 0; i < MAX_PENDING_TRIPS - 1; i++) {
                pendingTrips[i] = pendingTrips[i + 1];
            }
            count = MAX_PENDING_TRIPS - 1;
        }

        tripSequence++;
        String id = "VIA-" + String(tripSequence);

        if (timestamp.length() == 0) {
            timestamp = getFormattedTimestamp();
        }

        pendingTrips[count].tripId = id;
        pendingTrips[count].cardId = cardId;
        pendingTrips[count].fare = fare;
        pendingTrips[count].localTimestamp = timestamp;
        pendingTrips[count].wasDebtTrip = wasDebtTrip;
        pendingTrips[count].remainingBalance = remainingBalance;
        count++;

        Serial.printf("[STORAGE] Viaje registrado localmente: %s | Tarjeta: %s | Tarifa: S/ %.2f | Deuda: %s | Cola: %d\n",
                      id.c_str(), cardId.c_str(), fare, wasDebtTrip ? "SI" : "NO", count);
        return true;
    }

    int getPendingCount() const {
        return count;
    }

    // Formatear marca de tiempo ISO-8601 (YYYY-MM-DDTHH:MM:SS) requerida por el backend Spring Boot
    String getFormattedTimestamp() {
        time_t now;
        time(&now);
        struct tm timeinfo;
        if (gmtime_r(&now, &timeinfo) && now > 100000) {
            char buffer[32];
            strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%S", &timeinfo);
            return String(buffer);
        } else {
            // Timestamp sintético si aún no se sincronizó NTP
            unsigned long sec = millis() / 1000;
            char buffer[32];
            snprintf(buffer, sizeof(buffer), "2026-10-04T%02lu:%02lu:%02lu",
                     (sec / 3600) % 24, (sec / 60) % 60, sec % 60);
            return String(buffer);
        }
    }

    // US-10: Sincronización de lote de viajes hacia el backend
    bool syncBatchToBackend(const char* backendUrl, const char* busId, const char* signature, const char* keyId, int& outHttpCode) {
        if (count == 0) {
            return true; // Nada pendiente
        }

        if (WiFi.status() != WL_CONNECTED) {
            outHttpCode = -1;
            return false;
        }

        HTTPClient http;
        String endpoint = String(backendUrl) + BATCH_TRIPS_ENDPOINT;
        http.begin(endpoint);
        http.addHeader("Content-Type", "application/json");

        // Construir JSON con ArduinoJson
        DynamicJsonDocument doc(4096);
        doc["busId"] = busId;
        doc["firma"] = signature;
        doc["claveId"] = keyId;

        JsonArray tripsArray = doc.createNestedArray("trips");
        int batchSize = (count > 20) ? 20 : count; // Enviar hasta 20 viajes por lote

        for (int i = 0; i < batchSize; i++) {
            JsonObject t = tripsArray.createNestedObject();
            t["tripId"] = pendingTrips[i].tripId;
            t["cardId"] = pendingTrips[i].cardId;
            t["fare"] = pendingTrips[i].fare;
            t["localTimestamp"] = pendingTrips[i].localTimestamp;
        }

        String requestBody;
        serializeJson(doc, requestBody);

        Serial.printf("[HTTP] Despachando lote de %d viajes a: %s\n", batchSize, endpoint.c_str());
        int httpResponseCode = http.POST(requestBody);
        outHttpCode = httpResponseCode;

        if (httpResponseCode == 200 || httpResponseCode == 201) {
            String response = http.getString();
            Serial.printf("[HTTP] Respuesta exitosa del Backend (200 OK): %s\n", response.c_str());

            // Purga segura de los viajes confirmados (idempotencia cumplida)
            int remaining = count - batchSize;
            for (int i = 0; i < remaining; i++) {
                pendingTrips[i] = pendingTrips[i + batchSize];
            }
            count = remaining;
            Serial.printf("[STORAGE] Lote purgado. Viajes restantes en cola: %d\n", count);

            http.end();
            return true;
        } else {
            Serial.printf("[HTTP] Error enviando lote al backend. Código HTTP: %d\n", httpResponseCode);
            String errResponse = http.getString();
            Serial.printf("[HTTP] Detalle del error: %s\n", errResponse.c_str());
            http.end();
            return false;
        }
    }

    // US-08: Consultar movimientos locales (auditoría)
    void printTripLog() {
        Serial.println("--- HISTORIAL DE VIAJES PENDIENTES EN COLA ---");
        for (int i = 0; i < count; i++) {
            Serial.printf(" [%02d] %s | Tarjeta: %s | Tarifa: S/ %.2f | Deuda: %s | Fecha: %s\n",
                          i + 1, pendingTrips[i].tripId.c_str(),
                          pendingTrips[i].cardId.c_str(), pendingTrips[i].fare,
                          pendingTrips[i].wasDebtTrip ? "SI" : "NO",
                          pendingTrips[i].localTimestamp.c_str());
        }
        Serial.println("----------------------------------------------");
    }
};

#endif // TRANQI_TRIP_STORAGE_H
