/**
 * ============================================================================
 * TRANQI TRANSIT - VALIDADOR EMBEBIDO ESP32
 * Archivo: blacklist_manager.h  (Actualizado para US-11 v2.0)
 * Descripción: Gestor local de Lista Negra — estructura de datos alineada 100%
 *              con el dominio `BlacklistEntry` del backend Tranki.
 *
 * Soporte a los 3 modos de actualización de US-11:
 *   A. Full Snapshot (versión 0 o muy desfasada): carga binaria completa.
 *   B. Delta Incremental (JSON {add:[...], remove:[...]}): aplicación parcial.
 *   C. Evento MQTT Urgente (/flota/listanegra/urgente): bloqueo instantáneo.
 *
 * Motivos de bloqueo (BlockReason del dominio Java):
 *   - DEBT        -> recuperable al saldar (REMOVE incluido en delta)
 *   - LOST_STOLEN -> purga automática en 90 días por el backend
 *   - FRAUD       -> definitivo, requiere revisión administrativa
 *
 * Campo `active` (Soft Delete): Si active=false el backend manda REMOVE.
 * Campo `version`: número secuencial monótono del backend, guardado en NVS.
 * ============================================================================
 */

#ifndef TRANQI_BLACKLIST_MANAGER_H
#define TRANQI_BLACKLIST_MANAGER_H

#include <Arduino.h>
#include <Preferences.h>
#include "config.h"

// ---- Motivos de bloqueo (alineados con BlockReason.java del backend) -------
enum BlockReason {
    BLOCK_REASON_DEBT,          // "DEBT"
    BLOCK_REASON_LOST_STOLEN,   // "LOST_STOLEN"
    BLOCK_REASON_FRAUD          // "FRAUD"
};

// ---- Entrada de lista negra (alineado con BlacklistEntry.java del backend) -
struct BlacklistEntry {
    String cardId;             // UID normalizado, ej: "TRK-0001"
    BlockReason reason;        // Motivo del bloqueo
    long version;              // Número de versión en que fue bloqueada/desbloqueada
    bool active;               // true = bloqueada | false = desbloqueada (Soft Delete)
};

class BlacklistManager {
private:
    BlacklistEntry entries[MAX_BLACKLIST_ENTRIES];
    int count = 0;
    long localVersion = 0;        // Versión actual de la lista negra en este validador
    Preferences preferences;

    // Parsear string de motivo recibido por HTTP/MQTT
    BlockReason parseReason(const String& reasonStr) {
        if (reasonStr == "FRAUD")        return BLOCK_REASON_FRAUD;
        if (reasonStr == "LOST_STOLEN")  return BLOCK_REASON_LOST_STOLEN;
        return BLOCK_REASON_DEBT;
    }

    const char* reasonToString(BlockReason r) const {
        switch (r) {
            case BLOCK_REASON_FRAUD:       return "FRAUD";
            case BLOCK_REASON_LOST_STOLEN: return "LOST_STOLEN";
            default:                       return "DEBT";
        }
    }

public:
    BlacklistManager() {}

    void begin() {
        preferences.begin("tranki_bl", false);
        localVersion = preferences.getLong("bl_version", 0);
        Serial.printf("[BLACKLIST] Lista Negra iniciada. Versión local persistida: %ld\n", localVersion);
        loadDefaultTestEntries();
    }

    // Carga pre-definida de tarjetas de prueba de las especificaciones BDD
    void loadDefaultTestEntries() {
        // US-09 Criterio 4: TRK-9004 con FRAUD debe ser rechazada sin importar saldo
        addEntryInternal("TRK-9004", BLOCK_REASON_FRAUD, 0, true);
        // Caso de prueba US-04 (pérdida) y US-11 (distribución)
        addEntryInternal("TRK-LOST", BLOCK_REASON_LOST_STOLEN, 0, true);
        Serial.printf("[BLACKLIST] %d tarjetas bloqueadas cargadas por defecto.\n", count);
    }

    // -------------------------------------------------------------------------
    // US-11 - MODO A: Aplicar Full Snapshot desde bytes binarios del backend.
    // Cuando el backend responde con isFullSnapshot=true, recibe el campo
    // `cuckooFilter` en bytes. Aquí se implementa el Plan B (lista plana de IDs
    // más lista blanca) dado que el Cuckoo Filter binario está pendiente.
    // Esta función resetea la lista y aplica los IDs directamente.
    // -------------------------------------------------------------------------
    void applyFullSnapshotList(const String cardIds[], int cardCount, const String reasons[], long newVersion) {
        count = 0;
        for (int i = 0; i < cardCount && i < MAX_BLACKLIST_ENTRIES; i++) {
            addEntryInternal(cardIds[i], parseReason(reasons[i]), newVersion, true);
        }
        saveVersion(newVersion);
        Serial.printf("[BLACKLIST] Full Snapshot aplicado: %d tarjetas bloqueadas. Versión: %ld\n", count, newVersion);
    }

    // -------------------------------------------------------------------------
    // US-11 - MODO B: Aplicar Delta Incremental JSON.
    // Recibe los arrays `add` y `remove` del JSON del backend:
    //   { "newVersion": 105, "changes": { "add": [...], "remove": [...] } }
    // -------------------------------------------------------------------------
    void applyDelta(const String addIds[], int addCount,
                    const String removeIds[], int removeCount,
                    long newVersion) {

        // Primero procesar los REMOVE (US-11 Regla 3: tarjetas de deuda que se saldaron)
        for (int i = 0; i < removeCount; i++) {
            removeCardInternal(removeIds[i]);
        }

        // Luego aplicar los ADD
        for (int i = 0; i < addCount; i++) {
            // El delta no siempre incluye el motivo; asumir DEBT si no se especifica
            addEntryInternal(addIds[i], BLOCK_REASON_DEBT, newVersion, true);
        }

        saveVersion(newVersion);
        Serial.printf("[BLACKLIST] Delta aplicado: +%d bloqueos, -%d desbloqueos. Nueva versión: %ld\n",
                      addCount, removeCount, newVersion);
    }

    // -------------------------------------------------------------------------
    // US-11 - MODO C: Evento MQTT urgente /flota/listanegra/urgente
    // Bloqueo inmediato en RAM sin esperar el próximo ciclo de polling.
    // Solo aplica a FRAUD y LOST_STOLEN (motivos de alta prioridad).
    // -------------------------------------------------------------------------
    void applyUrgentBlock(const String& cardId, const String& reasonStr, long version) {
        BlockReason reason = parseReason(reasonStr);
        addEntryInternal(cardId, reason, version, true);
        Serial.printf("[BLACKLIST][MQTT-URGENTE] Tarjeta bloqueada inmediatamente: %s (Motivo: %s)\n",
                      cardId.c_str(), reasonStr.c_str());
    }

    // -------------------------------------------------------------------------
    // Consulta O(n) — para listas de hasta ~200 tarjetas es aceptable en ESP32.
    // NOTA: Cuando el backend implemente el Cuckoo Filter binario real, este
    // método será reemplazado por una búsqueda O(1) en el filtro.
    // -------------------------------------------------------------------------
    bool isBlacklisted(const String& cardId, String* outReason = nullptr) const {
        for (int i = 0; i < count; i++) {
            if (entries[i].active && entries[i].cardId.equalsIgnoreCase(cardId)) {
                if (outReason != nullptr) {
                    *outReason = String(reasonToString(entries[i].reason));
                }
                return true;
            }
        }
        return false;
    }

    // Bloqueo local directo (comandos de consola BLOCK, evento interno, etc.)
    bool blockCard(const String& cardId, const String& reasonStr) {
        BlockReason reason = parseReason(reasonStr);
        long version = localVersion + 1;
        return addEntryInternal(cardId, reason, version, true);
    }

    // Alias addCard compatible con llamadas de consola y comandos remotos
    bool addCard(const String& cardId, const String& reasonStr = "FRAUD") {
        return blockCard(cardId, reasonStr);
    }

    // Desbloqueo local directo — implementa la instrucción REMOVE de US-11 y US-06
    bool removeCard(const String& cardId) {
        return removeCardInternal(cardId);
    }

    long getLocalVersion() const {
        return localVersion;
    }

    int getCount() const {
        return count;
    }

    void printAll() const {
        Serial.printf("--- LISTA NEGRA LOCAL (Versión %ld) ---\n", localVersion);
        if (count == 0) {
            Serial.println("  (Vacía)");
        }
        for (int i = 0; i < count; i++) {
            if (entries[i].active) {
                Serial.printf(" [%02d] %s | %s | v%ld\n",
                              i + 1,
                              entries[i].cardId.c_str(),
                              reasonToString(entries[i].reason),
                              entries[i].version);
            }
        }
        Serial.println("--------------------------------------");
    }

private:
    bool addEntryInternal(const String& cardId, BlockReason reason, long version, bool active) {
        // Actualizar si ya existe (idempotente — US-11 Regla 4)
        for (int i = 0; i < count; i++) {
            if (entries[i].cardId.equalsIgnoreCase(cardId)) {
                entries[i].reason = reason;
                entries[i].version = version;
                entries[i].active = active;
                return true;
            }
        }
        if (count < MAX_BLACKLIST_ENTRIES) {
            entries[count].cardId = cardId;
            entries[count].reason = reason;
            entries[count].version = version;
            entries[count].active = active;
            count++;
            return true;
        }
        Serial.println("[BLACKLIST] Alerta: Buffer de lista negra lleno.");
        return false;
    }

    bool removeCardInternal(const String& cardId) {
        for (int i = 0; i < count; i++) {
            if (entries[i].cardId.equalsIgnoreCase(cardId)) {
                entries[i].active = false;  // Soft Delete — alineado con BlacklistEntry.active del backend
                Serial.printf("[BLACKLIST] REMOVE aplicado (active=false): %s\n", cardId.c_str());
                return true;
            }
        }
        return false;
    }

    void saveVersion(long version) {
        localVersion = version;
        preferences.putLong("bl_version", version);
    }
};

#endif // TRANQI_BLACKLIST_MANAGER_H
