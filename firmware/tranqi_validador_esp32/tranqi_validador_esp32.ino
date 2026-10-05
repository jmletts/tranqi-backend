/**
 * ============================================================================
 * TRANQI TRANSIT - VALIDADOR EMBEBIDO INTELIGENTE (ESP32)
 * Proyecto: tranqi-backend
 * Archivo: tranqi_validador_esp32.ino
 * ============================================================================
 * Hardware soportado:
 *  - Microcontrolador: ESP32 (DevKit v1 / NodeMCU-32S)
 *  - Pantalla: OLED SSD1306 (0.96", 128x64, I2C en Pines 21 SDA y 22 SCL)
 *  - Lector RFID: MFRC522 (RC522, SPI en Pines 4 RST, 5 SDA/SS, 18 SCK, 19 MISO, 23 MOSI)
 *
 * Cumplimiento de las 14 Historias de Usuario (US-01 a US-14):
 *  - US-01: Auto-emisión de tarjetas con saldo inicial (General S/5.00, Escolar S/2.50, Univ S/5.00)
 *  - US-02: Categorías tarifarias dinámicas (General S/1.20, Escolar S/0.60, Universitario S/0.60)
 *  - US-03: Configuración de tarjetas inteligentes y formato de identificador único TRK-XXXX
 *  - US-04: Reporte de tarjeta perdida (Bloqueo inmediato local LOST_STOLEN)
 *  - US-05: Bloqueo de tarjeta por fraude (Bloqueo definitivo local FRAUD)
 *  - US-06: Confirmación de recarga y levantamiento de deudas (Acción REMOVE de lista negra)
 *  - US-07: Transferencia de saldo y actualización local de fondos
 *  - US-08: Consultas de movimientos y auditoría de abordajes locales
 *  - US-09: Validación offline estricta (<300ms), deducción de tarifa, margen de deuda (-5.00) y OLED
 *  - US-10: Sincronización batch HTTP POST a /api/v1/trips/batch con ACK y purga de cola
 *  - US-11: Publicación y mantenimiento de lista negra local
 *  - US-12: Identidad IAM de validador y credenciales seguras
 *  - US-13: Gestión de flota (HardwareId y BusId configurables)
 *  - US-14: Verificación criptográfica Zero-Trust (Firma y KeyId en lote)
 * ============================================================================
 */

#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <time.h>

#include "config.h"
#include "display_manager.h"
#include "card_manager.h"
#include "blacklist_manager.h"
#include "blacklist_sync.h"
#include "trip_storage.h"
#include "crypto_signer.h"
#include <PubSubClient.h>

// ----------------------------------------------------------------------------
// INSTANCIAS DE COMPONENTES DE HARDWARE Y SOFTWARE
// ----------------------------------------------------------------------------
MFRC522 mfrc522(RFID_SS_PIN, RFID_RST_PIN);
DisplayManager displayMgr;
CardManager cardMgr;
BlacklistManager blacklistMgr;
BlacklistSync blacklistSync(blacklistMgr);   // US-11: HTTP polling + MQTT urgente
TripStorage tripStorage;
CryptoSigner cryptoSigner;

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

// Variables de control de tiempo
unsigned long lastSyncCheck = 0;
unsigned long lastOledRefresh = 0;
unsigned long lastMqttHeartbeat = 0;
String lastCardUidRead = "";
unsigned long lastCardTime = 0;

// ----------------------------------------------------------------------------
// PROTOTIPOS DE FUNCIONES
// ----------------------------------------------------------------------------
void setupHardware();
void connectWiFi();
void checkWiFiConnection();
void handleCardPresence();
void processValidation(const String& cardId);
void handleSerialCommands();
void syncTripsIfNeeded();
void syncBlacklistIfNeeded();   // US-11: Polling y MQTT de Lista Negra
void mqttCallback(char* topic, byte* payload, unsigned int length);
void reconnectMqtt();
void publishHeartbeat();
void handleRemoteCommand(const String& topic, const String& jsonStr);

// ----------------------------------------------------------------------------
// SETUP PRINCIPAL
// ----------------------------------------------------------------------------
void setup() {
    Serial.begin(115200);
    delay(1000);
    Serial.println("\n\n=======================================================");
    Serial.println("  TRANQI TRANSIT - VALIDADOR EMBEBIDO ESP32 INICIANDO  ");
    Serial.printf("  Unidad: %s | Backend: %s\n", BUS_ID, BACKEND_BASE_URL);
    Serial.println("=======================================================");

    // Pin de LED de estado (opcional)
    #if LED_STATUS_PIN >= 0
    pinMode(LED_STATUS_PIN, OUTPUT);
    digitalWrite(LED_STATUS_PIN, LOW);
    #endif

    // Inicializar Pantalla OLED SSD1306 (I2C: SDA 21, SCL 22)
    displayMgr.begin();
    displayMgr.showBootScreen();
    delay(1200);

    // Inicializar SPI y Lector RFID MFRC522 (Pines: RST 4, SS 5, SCK 18, MISO 19, MOSI 23)
    SPI.begin(RFID_SCK_PIN, RFID_MISO_PIN, RFID_MOSI_PIN, RFID_SS_PIN);
    mfrc522.PCD_Init();
    delay(50);
    mfrc522.PCD_SetAntennaGain(mfrc522.RxGain_max); // Máxima ganancia de antena para mejor lectura
    Serial.println("[RFID] Lector MFRC522 inicializado exitosamente.");

    // Inicializar submódulos de dominio
    cardMgr.begin();
    blacklistMgr.begin();
    blacklistSync.begin();     // US-11: Arranca gestor de polling HTTP + MQTT
    tripStorage.begin();
    cryptoSigner.begin();

    // Configurar MQTT
    mqttClient.setServer(MQTT_BROKER_HOST, MQTT_BROKER_PORT);
    mqttClient.setCallback(mqttCallback);

    // Iniciar conexión Wi-Fi en segundo plano
    connectWiFi();

    // Configurar cliente NTP para marcas de tiempo reales (Zona horaria Perú UTC-5)
    configTime(-5 * 3600, 0, "pool.ntp.org", "time.google.com");

    Serial.println("\n[SISTEMA] Validador listo para operar en modo offline u online.");
    Serial.println("[CONSOLA] Escriba 'HELP' en el monitor serial para ver los comandos de prueba interactiva.");
}

// ----------------------------------------------------------------------------
// BUCLE PRINCIPAL (LOOP)
// ----------------------------------------------------------------------------
void loop() {
    // 1. Verificar lectura física con el lector RFID MFRC522
    handleCardPresence();

    // 2. Procesar comandos interactivos desde la consola serie
    handleSerialCommands();

    // 3. Gestión de sincronización de Lista Negra vía HTTP polling (US-11)
    syncBlacklistIfNeeded();

    // 3.5. Mantener conexión MQTT y procesar mensajes entrantes (US-11)
    if (WiFi.status() == WL_CONNECTED) {
        if (!mqttClient.connected()) {
            reconnectMqtt();
        }
        mqttClient.loop();

        // 3.6. Publicar Heartbeat de Telemetría periódicamente
        if (mqttClient.connected() && (millis() - lastMqttHeartbeat > MQTT_HEARTBEAT_INTERVAL_MS)) {
            lastMqttHeartbeat = millis();
            publishHeartbeat();
        }
    }

    // 4. Gestión de sincronización batch hacia el backend cuando hay Wi-Fi (US-10)
    syncTripsIfNeeded();

    // 5. Actualizar pantalla OLED cuando está en reposo
    if (millis() - lastOledRefresh > 250) {
        lastOledRefresh = millis();
        bool isWifi = (WiFi.status() == WL_CONNECTED);
        displayMgr.showIdleScreen(isWifi, tripStorage.getPendingCount(), BUS_ID);
    }

    yield();
}

// ----------------------------------------------------------------------------
// US-09: LECTURA Y VALIDACIÓN DE ABORDAJE OFFLINE (< 300 ms)
// ----------------------------------------------------------------------------
void handleCardPresence() {
    // Comprobar si hay una tarjeta nueva presente
    if (!mfrc522.PICC_IsNewCardPresent()) {
        return;
    }

    // Leer el número de serie de la tarjeta
    if (!mfrc522.PICC_ReadCardSerial()) {
        return;
    }

    // Extraer el UID en formato hexadecimal
    String uidStr = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
        if (mfrc522.uid.uidByte[i] < 0x10) uidStr += "0";
        uidStr += String(mfrc522.uid.uidByte[i], HEX);
    }
    uidStr.toUpperCase();
    String formattedCardId = "TRK-" + uidStr;

    // Evitar lecturas múltiples si la tarjeta permanece quieta sobre el sensor (rebote de 2 segundos)
    if (formattedCardId == lastCardUidRead && (millis() - lastCardTime < 2500)) {
        mfrc522.PICC_HaltA();
        mfrc522.PCD_StopCrypto1();
        return;
    }

    lastCardUidRead = formattedCardId;
    lastCardTime = millis();

    Serial.printf("\n[RFID] Tarjeta detectada en antena. UID: %s -> ID Formateado: %s\n",
                  uidStr.c_str(), formattedCardId.c_str());

    // Ejecutar lógica de validación
    processValidation(formattedCardId);

    // Detener comunicación con la tarjeta actual
    mfrc522.PICC_HaltA();
    mfrc522.PCD_StopCrypto1();
}

/**
 * Núcleo de validación autónoma offline:
 * - 0 peticiones HTTP síncronas
 * - Consulta a lista negra local
 * - Deducción de tarifa según categoría
 * - Margen de deuda (-5.00)
 * - Encolado en memoria y feedback visual en OLED
 */
void processValidation(const String& cardId) {
    unsigned long startMs = millis();

    #if LED_STATUS_PIN >= 0
    digitalWrite(LED_STATUS_PIN, HIGH);
    #endif

    // PASO 1: Verificación de Lista Negra Local (US-04, US-05, US-09, US-11)
    String blockReason = "";
    if (blacklistMgr.isBlacklisted(cardId, &blockReason)) {
        Serial.printf("[ACCESO] RECHAZADO: Tarjeta %s bloqueada en Lista Negra (Motivo: %s)\n",
                      cardId.c_str(), blockReason.c_str());
        
        displayMgr.showRejected(cardId, "TARJETA BLOQUEADA", 0.00f);

        // Notificar rechazo vía MQTT si conectado
        if (mqttClient.connected()) {
            StaticJsonDocument<256> evDoc;
            evDoc["type"] = "VALIDATION";
            evDoc["busId"] = BUS_ID;
            evDoc["cardId"] = cardId;
            evDoc["status"] = "REJECTED";
            evDoc["reason"] = "BLOQUEADA (" + blockReason + ")";
            evDoc["balance"] = 0.00f;
            evDoc["timestamp"] = tripStorage.getFormattedTimestamp();
            String evPayload;
            serializeJson(evDoc, evPayload);
            mqttClient.publish(MQTT_TOPIC_EVENTS, evPayload.c_str());
        }

        #if LED_STATUS_PIN >= 0
        digitalWrite(LED_STATUS_PIN, LOW);
        #endif
        return;
    }

    // PASO 2: Obtener o auto-registrar tarjeta según US-01 (Emisión con saldo reglamentario)
    CardData* card = cardMgr.getOrCreateCard(cardId);
    if (card == nullptr) {
        displayMgr.showRejected(cardId, "ERROR INTERNO", 0.00f);
        #if LED_STATUS_PIN >= 0
        digitalWrite(LED_STATUS_PIN, LOW);
        #endif
        return;
    }

    // PASO 3: Determinar tarifa según categoría tarifaria (US-02, US-09)
    float fare = cardMgr.getFare(card->category);
    float currentBalance = card->balance;
    float resultingBalance = currentBalance - fare;

    // PASO 4: Evaluación de Saldo y Margen de Deuda Máximo (US-09 y domain-rules.md)
    if (resultingBalance < MARGEN_DEUDA_MAXIMO) {
        // Rechazo: Saldo insuficiente que sobrepasa el margen de deuda (-5.00)
        Serial.printf("[ACCESO] RECHAZADO: Saldo insuficiente. Saldo: S/ %.2f, Tarifa: S/ %.2f, Resultante: S/ %.2f < Límite (%.2f)\n",
                      currentBalance, fare, resultingBalance, MARGEN_DEUDA_MAXIMO);

        displayMgr.showRejected(cardId, "SALDO INSUFICIENTE", currentBalance);

        if (mqttClient.connected()) {
            StaticJsonDocument<256> evDoc;
            evDoc["type"] = "VALIDATION";
            evDoc["busId"] = BUS_ID;
            evDoc["cardId"] = cardId;
            evDoc["status"] = "REJECTED";
            evDoc["reason"] = "SALDO_INSUFICIENTE";
            evDoc["balance"] = currentBalance;
            evDoc["fare"] = fare;
            evDoc["timestamp"] = tripStorage.getFormattedTimestamp();
            String evPayload;
            serializeJson(evDoc, evPayload);
            mqttClient.publish(MQTT_TOPIC_EVENTS, evPayload.c_str());
        }

        #if LED_STATUS_PIN >= 0
        digitalWrite(LED_STATUS_PIN, LOW);
        #endif
        return;
    }

    // PASO 5: Abordaje Autorizado
    bool wasDebtTrip = (resultingBalance < 0.00f);
    card->balance = resultingBalance;

    Serial.printf("[ACCESO] AUTORIZADO: Tarjeta %s | Cat: %s | Tarifa: -S/ %.2f | Saldo anterior: S/ %.2f | Nuevo Saldo: S/ %.2f | Deuda: %s\n",
                  cardId.c_str(), cardMgr.getCategoryName(card->category), fare, currentBalance, resultingBalance, wasDebtTrip ? "SI" : "NO");

    // PASO 6: Encolar viaje en almacenamiento local para sincronización posterior (US-08, US-09, US-10)
    tripStorage.recordTrip(cardId, fare, wasDebtTrip, resultingBalance);

    // PASO 7: Feedback en Pantalla OLED SSD1306
    displayMgr.showAuthorized(cardId, cardMgr.getCategoryName(card->category), fare, resultingBalance, wasDebtTrip);

    unsigned long elapsed = millis() - startMs;
    Serial.printf("[RENDIMIENTO] Validación completada en %lu ms (Requisito US-09: < 300 ms)\n", elapsed);

    // Notificar autorización en tiempo real vía MQTT
    if (mqttClient.connected()) {
        StaticJsonDocument<256> evDoc;
        evDoc["type"] = "VALIDATION";
        evDoc["busId"] = BUS_ID;
        evDoc["cardId"] = cardId;
        evDoc["category"] = cardMgr.getCategoryName(card->category);
        evDoc["fare"] = fare;
        evDoc["balance"] = resultingBalance;
        evDoc["status"] = "AUTHORIZED";
        evDoc["debt"] = wasDebtTrip;
        evDoc["elapsedMs"] = elapsed;
        evDoc["timestamp"] = tripStorage.getFormattedTimestamp();
        String evPayload;
        serializeJson(evDoc, evPayload);
        mqttClient.publish(MQTT_TOPIC_EVENTS, evPayload.c_str());
    }

    #if LED_STATUS_PIN >= 0
    digitalWrite(LED_STATUS_PIN, LOW);
    #endif
}

// ----------------------------------------------------------------------------
// US-10: SINCRONIZACIÓN ASÍNCRONA DE LOTES DE VIAJES AL BACKEND
// ----------------------------------------------------------------------------
void syncTripsIfNeeded() {
    if (millis() - lastSyncCheck < (SYNC_INTERVAL_SECONDS * 1000)) {
        return;
    }
    lastSyncCheck = millis();

    // Verificar si hay viajes pendientes y conexión Wi-Fi disponible
    if (tripStorage.getPendingCount() == 0) {
        return;
    }

    if (WiFi.status() != WL_CONNECTED) {
        // Modo offline: los viajes siguen almacenados de forma segura
        return;
    }

    Serial.printf("\n[SYNC] Iniciando sincronización de lote (%d viajes pendientes)...\n",
                  tripStorage.getPendingCount());

    int httpCode = 0;
    String sig = cryptoSigner.getSignature("");
    String keyId = cryptoSigner.getKeyId();

    bool ok = tripStorage.syncBatchToBackend(BACKEND_BASE_URL, BUS_ID, sig.c_str(), keyId.c_str(), httpCode);
    displayMgr.showSyncStatus(tripStorage.getPendingCount(), ok, httpCode);

    if (mqttClient.connected()) {
        StaticJsonDocument<256> evDoc;
        evDoc["type"] = "BATCH_SYNC";
        evDoc["busId"] = BUS_ID;
        evDoc["status"] = ok ? "SUCCESS" : "ERROR";
        evDoc["httpCode"] = httpCode;
        evDoc["pending"] = tripStorage.getPendingCount();
        evDoc["timestamp"] = tripStorage.getFormattedTimestamp();
        String evPayload;
        serializeJson(evDoc, evPayload);
        mqttClient.publish(MQTT_TOPIC_EVENTS, evPayload.c_str());
    }
}

// ----------------------------------------------------------------------------
// US-11: POLLING DE LISTA NEGRA HACIA EL BACKEND (cada 60 segundos)
// ----------------------------------------------------------------------------
void syncBlacklistIfNeeded() {
    blacklistSync.tick();
}

// ----------------------------------------------------------------------------
// US-11: CALLBACK Y RECONEXIÓN MQTT PARA ALERTAS URGENTES Y TELEMETRÍA
// ----------------------------------------------------------------------------
void mqttCallback(char* topic, byte* payload, unsigned int length) {
    String msg = "";
    for (unsigned int i = 0; i < length; i++) {
        msg += (char)payload[i];
    }
    
    if (String(topic) == blacklistSync.getMqttTopic()) {
        blacklistSync.onMqttUrgentEvent(msg);
    } else if (String(topic) == MQTT_TOPIC_COMMAND || String(topic) == MQTT_TOPIC_COMMAND_ALL) {
        handleRemoteCommand(String(topic), msg);
    }
}

void reconnectMqtt() {
    // Intentar reconectar si han pasado 5 segundos desde el último intento para no bloquear el loop
    static unsigned long lastReconnectAttempt = 0;
    if (millis() - lastReconnectAttempt > 5000) {
        lastReconnectAttempt = millis();
        Serial.printf("[MQTT] Intentando conectar a %s:%d...\n", MQTT_BROKER_HOST, MQTT_BROKER_PORT);
        if (mqttClient.connect(MQTT_CLIENT_ID)) {
            Serial.println("[MQTT] Conectado exitosamente al broker Mosquitto.");
            // 1. Suscribirse a tópico urgente de lista negra (US-11)
            mqttClient.subscribe(blacklistSync.getMqttTopic(), 1); // QoS 1
            // 2. Suscribirse a tópicos de control y comandos remotos desde el Dashboard
            mqttClient.subscribe(MQTT_TOPIC_COMMAND, 1);
            mqttClient.subscribe(MQTT_TOPIC_COMMAND_ALL, 1);
            Serial.printf("[MQTT] Suscrito a comandos: %s y %s\n", MQTT_TOPIC_COMMAND, MQTT_TOPIC_COMMAND_ALL);
            // 3. Emitir telemetría de presencia inmediata
            publishHeartbeat();
        } else {
            Serial.printf("[MQTT] Falló conexión, rc=%d. Reintento en 5s.\n", mqttClient.state());
        }
    }
}

// ----------------------------------------------------------------------------
// TELEMETRÍA Y HEARTBEAT DEL VALIDADOR EN TIEMPO REAL
// ----------------------------------------------------------------------------
void publishHeartbeat() {
    if (!mqttClient.connected()) return;

    StaticJsonDocument<384> doc;
    doc["busId"] = BUS_ID;
    doc["validatorKeyId"] = VALIDATOR_KEY_ID;
    doc["wifi"] = (WiFi.status() == WL_CONNECTED);
    doc["rssi"] = WiFi.RSSI();
    doc["ip"] = WiFi.localIP().toString();
    doc["pendingTrips"] = tripStorage.getPendingCount();
    doc["blVersion"] = blacklistMgr.getLocalVersion();
    doc["blCount"] = blacklistMgr.getCount();
    doc["cardsCount"] = cardMgr.getCount();
    doc["uptimeSec"] = millis() / 1000;
    doc["freeHeap"] = ESP.getFreeHeap();
    doc["status"] = "OPERATIONAL";

    String payload;
    serializeJson(doc, payload);
    mqttClient.publish(MQTT_TOPIC_STATUS, payload.c_str());
    Serial.printf("[MQTT] Heartbeat publicado en %s: %s\n", MQTT_TOPIC_STATUS, payload.c_str());
}

// ----------------------------------------------------------------------------
// PROCESAMIENTO DE COMANDOS REMOTOS DESDE EL DASHBOARD WEB
// ----------------------------------------------------------------------------
void handleRemoteCommand(const String& topic, const String& jsonStr) {
    StaticJsonDocument<384> cmdDoc;
    DeserializationError err = deserializeJson(cmdDoc, jsonStr);
    if (err) {
        Serial.printf("[REMOTE-CMD] Error deserializando comando: %s\n", err.c_str());
        return;
    }

    String action = cmdDoc["action"] | cmdDoc["cmd"] | "";
    action.toUpperCase();

    Serial.printf("[REMOTE-CMD] Ejecutando comando remoto: '%s'\n", action.c_str());

    if (action == "TAP") {
        String cardId = cmdDoc["cardId"] | "";
        if (cardId.length() > 0) {
            processValidation(cardId);
        }
    } else if (action == "RECHARGE") {
        String cardId = cmdDoc["cardId"] | "";
        float amount = cmdDoc["amount"] | 0.0f;
        if (cardId.length() > 0 && amount > 0) {
            cardMgr.recharge(cardId, amount);
            blacklistMgr.removeCard(cardId);
            publishHeartbeat();
        }
    } else if (action == "BLOCK") {
        String cardId = cmdDoc["cardId"] | "";
        String reason = cmdDoc["reason"] | "FRAUD";
        if (cardId.length() > 0) {
            blacklistMgr.addCard(cardId, reason);
            publishHeartbeat();
        }
    } else if (action == "UNBLOCK") {
        String cardId = cmdDoc["cardId"] | "";
        if (cardId.length() > 0) {
            blacklistMgr.removeCard(cardId);
            publishHeartbeat();
        }
    } else if (action == "SET_CAT") {
        String cardId = cmdDoc["cardId"] | "";
        String catStr = cmdDoc["category"] | "GENERAL";
        catStr.toUpperCase();
        FareCategoryEnum newCat = CAT_GENERAL;
        if (catStr == "SCHOOL") newCat = CAT_SCHOOL;
        else if (catStr == "UNIVERSITY") newCat = CAT_UNIVERSITY;
        if (cardId.length() > 0) {
            cardMgr.setCategory(cardId, newCat);
            publishHeartbeat();
        }
    } else if (action == "SYNC") {
        int httpCode = 0;
        String sig = cryptoSigner.getSignature("");
        String keyId = cryptoSigner.getKeyId();
        bool ok = tripStorage.syncBatchToBackend(BACKEND_BASE_URL, BUS_ID, sig.c_str(), keyId.c_str(), httpCode);
        displayMgr.showSyncStatus(tripStorage.getPendingCount(), ok, httpCode);
        publishHeartbeat();
    } else if (action == "SYNCBL") {
        blacklistSync.forceSync();
        publishHeartbeat();
    } else if (action == "PING") {
        publishHeartbeat();
    }
}

// ----------------------------------------------------------------------------
// GESTIÓN DE CONECTIVIDAD WI-FI (OFFLINE-FIRST RESILIENTE)
// ----------------------------------------------------------------------------
void connectWiFi() {
    Serial.printf("[WIFI] Conectando a red SSID: %s ...\n", WIFI_SSID);
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

// ----------------------------------------------------------------------------
// CONSOLA INTERACTIVA POR PUERTO SERIE (TESTING INTEGRAL DE LAS 14 US)
// ----------------------------------------------------------------------------
void handleSerialCommands() {
    if (!Serial.available()) return;

    String line = Serial.readStringUntil('\n');
    line.trim();
    if (line.length() == 0) return;

    int firstSpace = line.indexOf(' ');
    String cmd = (firstSpace == -1) ? line : line.substring(0, firstSpace);
    cmd.toUpperCase();

    String args = (firstSpace == -1) ? "" : line.substring(firstSpace + 1);
    args.trim();

    if (cmd == "HELP") {
        Serial.println("\n========== COMANDOS DISPONIBLES EN CONSOLA TRANQI ==========");
        Serial.println(" TAP <cardId>              : Simular aproximación de tarjeta (US-09)");
        Serial.println("   Ej: TAP TRK-001         -> Saldo 10.00 - cobra 1.20 = 8.80");
        Serial.println("   Ej: TAP TRK-9002        -> Saldo 1.00 - cobra 1.20 = -0.20 (CREDITO)");
        Serial.println("   Ej: TAP TRK-9003        -> Saldo -4.50 - cobra 1.20 = -5.70 RECHAZADO");
        Serial.println("   Ej: TAP TRK-9004        -> FRAUDE en lista negra, RECHAZADO");
        Serial.println(" CAT <cardId> <CATEGORIA>  : Cambiar categoría (US-02): GENERAL|SCHOOL|UNIVERSITY");
        Serial.println(" RECHARGE <cardId> <monto> : Recargar saldo (US-06). Levanta bloqueo DEBT.");
        Serial.println(" BLOCK <cardId> [MOTIVO]   : Bloquear en Lista Negra (US-04/US-05)");
        Serial.println("   Motivos: FRAUD (definitivo) | LOST_STOLEN (90 días) | DEBT (hasta recarga)");
        Serial.println(" UNBLOCK <cardId>          : Quitar de Lista Negra / REMOVE (US-06, US-11)");
        Serial.println(" --- US-11: Lista Negra ---");
        Serial.println(" SYNCBL                    : Forzar poll HTTP GET /api/v1/blacklist/sync (US-11A)");
        Serial.println(" MQTT_SIM <cardId> <MOTIVO>: Simular evento MQTT urgente (US-11C)");
        Serial.println("   Ej: MQTT_SIM TRK-5001 FRAUD  -> Bloqueo instantáneo por fraude");
        Serial.println(" BLSTATUS                  : Ver versión local y entradas de lista negra");
        Serial.println(" --- General ---");
        Serial.println(" SYNC                      : Forzar envío de lote de viajes (US-10)");
        Serial.println(" STATUS                    : Estado de Wi-Fi, BusId y cola");
        Serial.println(" CARDS                     : Listar tarjetas registradas");
        Serial.println(" BLACKLIST                 : Listar tarjetas bloqueadas en Lista Negra");
        Serial.println(" LOGS                      : Listar viajes pendientes de sync");
        Serial.println("============================================================\n");
    }
    else if (cmd == "TAP") {
        if (args.length() == 0) {
            Serial.println("[ERROR] Especifique el ID de tarjeta. Ej: TAP TRK-001");
            return;
        }
        Serial.printf("[CONSOLA] Simulando aproximación de tarjeta: %s\n", args.c_str());
        processValidation(args);
    }
    else if (cmd == "CAT") {
        int spaceIdx = args.indexOf(' ');
        if (spaceIdx == -1) {
            Serial.println("[ERROR] Uso: CAT <cardId> <GENERAL|SCHOOL|UNIVERSITY>");
            return;
        }
        String cId = args.substring(0, spaceIdx);
        String catStr = args.substring(spaceIdx + 1);
        catStr.toUpperCase();
        FareCategoryEnum newCat = CAT_GENERAL;
        if (catStr == "SCHOOL" || catStr == "ESCOLAR") newCat = CAT_SCHOOL;
        else if (catStr == "UNIVERSITY" || catStr == "UNIVERSITARIO") newCat = CAT_UNIVERSITY;

        cardMgr.setCategory(cId, newCat);
    }
    else if (cmd == "RECHARGE") {
        int spaceIdx = args.indexOf(' ');
        if (spaceIdx == -1) {
            Serial.println("[ERROR] Uso: RECHARGE <cardId> <monto>");
            return;
        }
        String cId = args.substring(0, spaceIdx);
        float amount = args.substring(spaceIdx + 1).toFloat();
        cardMgr.recharge(cId, amount);
        // Si estaba en lista negra por deuda, desbloquear (US-06)
        blacklistMgr.removeCard(cId);
    }
    else if (cmd == "BLOCK") {
        int spaceIdx = args.indexOf(' ');
        String cId = (spaceIdx == -1) ? args : args.substring(0, spaceIdx);
        String reason = (spaceIdx == -1) ? "FRAUD" : args.substring(spaceIdx + 1);
        reason.toUpperCase();
        blacklistMgr.addCard(cId, reason);
    }
    else if (cmd == "UNBLOCK") {
        blacklistMgr.removeCard(args);
    }
    else if (cmd == "SYNC") {
        Serial.println("[CONSOLA] Forzando sincronización inmediata de viajes (US-10)...");
        int httpCode = 0;
        String sig = cryptoSigner.getSignature("");
        String keyId = cryptoSigner.getKeyId();
        bool ok = tripStorage.syncBatchToBackend(BACKEND_BASE_URL, BUS_ID, sig.c_str(), keyId.c_str(), httpCode);
        displayMgr.showSyncStatus(tripStorage.getPendingCount(), ok, httpCode);
    }
    else if (cmd == "SYNCBL") {
        // US-11 Modo A: Poll HTTP GET /api/v1/blacklist/sync?localVersion=N
        Serial.printf("[CONSOLA] Forzando poll de Lista Negra (US-11A). Versión local actual: %ld\n",
                      blacklistMgr.getLocalVersion());
        blacklistSync.forceSync();
    }
    else if (cmd == "MQTT_SIM") {
        // US-11 Modo C: Simular evento MQTT urgente (sin broker real)
        // Uso: MQTT_SIM <cardId> <MOTIVO>
        int spaceIdx = args.indexOf(' ');
        String cId = (spaceIdx == -1) ? args : args.substring(0, spaceIdx);
        String reason = (spaceIdx == -1) ? "FRAUD" : args.substring(spaceIdx + 1);
        reason.toUpperCase();
        // Construir JSON como llegaría por MQTT /flota/listanegra/urgente
        String mqttPayload = "{\"action\":\"BLOCK\",\"cardId\":\"" + cId +
                             "\",\"reason\":\"" + reason +
                             "\",\"version\":" + String(blacklistMgr.getLocalVersion() + 1) + "}";
        Serial.printf("[CONSOLA] Simulando payload MQTT urgente: %s\n", mqttPayload.c_str());
        blacklistSync.onMqttUrgentEvent(mqttPayload);
    }
    else if (cmd == "BLSTATUS") {
        Serial.printf("[CONSOLA] Versión local de Lista Negra: %ld\n", blacklistMgr.getLocalVersion());
        blacklistMgr.printAll();
    }
    else if (cmd == "STATUS") {
        Serial.println("\n--- ESTADO DEL VALIDADOR TRANQI ---");
        Serial.printf(" Unidad: %s\n", BUS_ID);
        Serial.printf(" Clave Criptográfica: %s\n", VALIDATOR_KEY_ID);
        Serial.printf(" Estado Wi-Fi: %s (IP: %s)\n",
                      (WiFi.status() == WL_CONNECTED) ? "CONECTADO" : "DESCONECTADO",
                      WiFi.localIP().toString().c_str());
        Serial.printf(" Viajes en cola (pendientes de sync): %d\n", tripStorage.getPendingCount());
        Serial.printf(" Tarjetas bloqueadas en Lista Negra: %d\n", blacklistMgr.getCount());
        Serial.printf(" Backend URL: %s%s\n", BACKEND_BASE_URL, BATCH_TRIPS_ENDPOINT);
        Serial.println("------------------------------------");
    }
    else if (cmd == "CARDS") {
        cardMgr.printCards();
    }
    else if (cmd == "BLACKLIST") {
        blacklistMgr.printAll();
    }
    else if (cmd == "LOGS") {
        tripStorage.printTripLog();
    }
    else {
        Serial.printf("[CONSOLA] Comando desconocido: '%s'. Escriba 'HELP' para ver la lista.\n", cmd.c_str());
    }
}
