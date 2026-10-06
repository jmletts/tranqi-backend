/**
 * ============================================================================
 * TRANQI TRANSIT - VALIDADOR EMBEBIDO ESP32
 * Archivo: config.h
 * Descripción: Configuración global de hardware, red, pines y reglas de negocio
 * Alineado con las 14 Historias de Usuario (US-01 a US-14)
 * ============================================================================
 */

#ifndef TRANQI_CONFIG_H
#define TRANQI_CONFIG_H

#include <Arduino.h>

// ----------------------------------------------------------------------------
// 1. ASIGNACIÓN DE PINES DE HARDWARE (ESP32 DevKit v1)
// ----------------------------------------------------------------------------

// Pantalla OLED SSD1306 (Comunicación I2C)
#define OLED_SDA_PIN          21     // Pin 21 -> SDA del OLED
#define OLED_SCL_PIN          22     // Pin 22 -> SCL del OLED
#define OLED_SCREEN_WIDTH     128    // Ancho en píxeles
#define OLED_SCREEN_HEIGHT    64     // Alto en píxeles
#define OLED_RESET_PIN        -1     // Reset compartido o no utilizado (-1)
#define OLED_I2C_ADDRESS      0x3C   // Dirección I2C típica (0x3C o 0x3D)

// Lector RFID MFRC522 / RC522 (Comunicación SPI)
#define RFID_SS_PIN           5      // Pin 5  -> SDA / SS / CS del RC522
#define RFID_RST_PIN          4      // Pin 4  -> RST del RC522
#define RFID_SCK_PIN          18     // Pin 18 -> SCK del RC522
#define RFID_MISO_PIN         19     // Pin 19 -> MISO del RC522
#define RFID_MOSI_PIN         23     // Pin 23 -> MOSI del RC522
// IRQ del RC522 queda libre (sin conectar)
// Alimentación: 3.3V -> 3.3V (NUNCA A 5V) y GND -> GND

// Indicadores opcionales (LEDs / Buzzer)
#define LED_STATUS_PIN        2      // LED integrado de la placa ESP32
#define BUZZER_PIN            -1     // Buzzer pasivo/activo (-1 si no está conectado)

// ----------------------------------------------------------------------------
// 2. CONFIGURACIÓN DE GESTIÓN DE FLOTA (US-13) Y CRIPTOGRAFÍA (US-14)
// ----------------------------------------------------------------------------
#define BUS_ID                "BUS-201"                    // Identificador del validador / bus
#define VALIDATOR_KEY_ID      "VALIDADOR-ESP32-BUS-01-v1"  // Identificador de clave pública en backend
#define CRYPTO_SIGNATURE      "VALID_SIGNATURE"            // Firma criptográfica compatible con backend

// ----------------------------------------------------------------------------
// 3. REGLAS DE NEGOCIO Y TARIFAS (US-01, US-02, US-09 - domain-rules.md)
// ----------------------------------------------------------------------------
// Tarifas vigentes (en Soles S/)
#define TARIFA_GENERAL        1.20f   // Tarifa estándar sin subsidio
#define TARIFA_SCHOOL         0.60f   // Tarifa escolar (DNI)
#define TARIFA_UNIVERSITY     0.60f   // Tarifa universitaria (Carnet)

// Saldos iniciales al emitir tarjetas nuevas (US-01)
#define SALDO_INICIAL_GENERAL     5.00f
#define SALDO_INICIAL_SCHOOL      2.50f
#define SALDO_INICIAL_UNIVERSITY  5.00f

// Margen de Deuda Máximo permitido para viajes a crédito (US-09)
// Si saldo - tarifa < MARGEN_DEUDA_MAXIMO (-5.00), el abordaje se RECHAZA.
#define MARGEN_DEUDA_MAXIMO   -5.00f

// Tiempo en milisegundos que permanece el mensaje de resultado en el OLED
#define DISPLAY_RESULT_TIME_MS 3200

// ----------------------------------------------------------------------------
// 4. CONFIGURACIÓN DE CONECTIVIDAD WI-FI Y SINCRONIZACIÓN BATCH (US-10)
// ----------------------------------------------------------------------------
// Modifique con los datos de su red Wi-Fi
#define WIFI_SSID             "TERRY"
#define WIFI_PASSWORD         "a228640b"

// URL del Backend central Tranki (Spring Boot)
// Si corre localmente en su PC, reemplace con la IP local de su computadora (ej. 192.168.1.50:8080)
#define BACKEND_BASE_URL      "http://192.168.1.100:8080"
#define BATCH_TRIPS_ENDPOINT  "/api/v1/trips/batch"

// Intervalo de intento de sincronización de viajes en segundos cuando hay Wi-Fi
#define SYNC_INTERVAL_SECONDS 10

// Tamaño máximo del buffer de viajes pendientes en memoria flash / RAM
#define MAX_PENDING_TRIPS     50

// Límite de tarjetas en la lista negra local
#define MAX_BLACKLIST_ENTRIES 100

// ----------------------------------------------------------------------------
// 5. SINCRONIZACIÓN DE LISTA NEGRA US-11 (HTTP + MQTT)
// ----------------------------------------------------------------------------
// Endpoint de sincronización de Lista Negra (BlacklistSyncController.java)
// GET /api/v1/blacklist/sync?localVersion=N
// Responde con BlacklistSyncResponseDTO (JSON)
#define BLACKLIST_SYNC_ENDPOINT "/api/v1/blacklist/sync"

// Intervalo en ms entre polling de Lista Negra (60 seg = dentro del rate-limit del backend)
#define BLACKLIST_POLL_INTERVAL_MS 60000

// Tópico MQTT para eventos urgentes de fraude/pérdida (US-11 Regla 1C)
// El ESP32 se suscribe a este tópico para recibir bloqueos críticos en tiempo real
#define MQTT_TOPIC_BLACKLIST_URGENT "/flota/listanegra/urgente"

// Configuración del Broker MQTT (completar con IP/host real en producción)
#define MQTT_BROKER_HOST      "192.168.1.100"  // IP del servidor MQTT (mismo que backend o separado)
#define MQTT_BROKER_PORT      1883
#define MQTT_CLIENT_ID        BUS_ID           // Usar el BUS_ID como client ID único MQTT

// ----------------------------------------------------------------------------
// 6. TÓPICOS MQTT PARA TELEMETRÍA, COMANDOS Y ESTADO DEL VALIDADOR
// ----------------------------------------------------------------------------
#define MQTT_TOPIC_STATUS             "/flota/validadores/" BUS_ID "/status"
#define MQTT_TOPIC_EVENTS             "/flota/validadores/" BUS_ID "/events"
#define MQTT_TOPIC_COMMAND            "/flota/validadores/" BUS_ID "/command"
#define MQTT_TOPIC_COMMAND_ALL        "/flota/validadores/commands"
#define MQTT_HEARTBEAT_INTERVAL_MS    15000  // Heartbeat cada 15s

#endif // TRANQI_CONFIG_H
