#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // Requiere instalar ArduinoJson

// Librerías para criptografía
#include "mbedtls/md.h"
#include "mbedtls/pk.h"
#include "mbedtls/entropy.h"
#include "mbedtls/ctr_drbg.h"
#include "mbedtls/base64.h"

// Librerías para Hardware (RFID y OLED)
#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ==========================================
// CONFIGURACIÓN DE RED Y BACKEND
// ==========================================
const char* ssid = "TU_WIFI_SSID";
const char* password = "TU_WIFI_PASSWORD";
const char* backendUrl = "http://192.168.1.100:8080/api/v1/trips/batch"; 

// ==========================================
// CONFIGURACIÓN HARDWARE: PINES
// ==========================================
// Pines RFID MFRC522 (SPI)
#define RST_PIN   4
#define SS_PIN    5    // También llamado SDA/CS
// SCK=18, MISO=19, MOSI=23 se usan por defecto en SPI.begin() en ESP32

MFRC522 mfrc522(SS_PIN, RST_PIN);

// Pines OLED SSD1306 (I2C)
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1 // No usamos pin de reset para la pantalla
#define SCREEN_ADDRESS 0x3C // Dirección I2C típica para 0.96" OLED
// SDA=21, SCL=22 se configuran en Wire.begin()

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ==========================================
// CONFIGURACIÓN DEL BUS Y CLAVES
// ==========================================
const String busId = "ESP32-BUS-01";
const String claveId = "VALIDADOR-ESP32-BUS-01-v1";

const char* private_key_pem = 
"-----BEGIN EC PRIVATE KEY-----\n"
"MHcCAQEEINKn00BvLhNlZtW5h/N44RkF+e8BpeH+p6p1+BwI7yvDoAoGCCqGSM49\n"
"AwEHoUQDQgAEY+5wZz/V0jA/A4wM2O3s14lQO1n031oN4Pq83sJ1oV2bT4sY8x0\n"
"7aW3zXv+zQ6R9T1b2GZ2hZ3cZqZ6yH7wA==\n"
"-----END EC PRIVATE KEY-----\n";

// ==========================================
// LISTA NEGRA Y DATOS
// ==========================================
// Para las pruebas, añadiremos también los UUIDs hexadecimales de tus tarjetas reales
const char* blacklist[] = { "TRK-BLOCKED", "A1B2C3D4" }; 
const int blacklistSize = 2;

struct Trip {
  String tripId;
  String cardId;
  float fare;
  String localTimestamp;
};

const int MAX_TRIPS = 10;
Trip tripQueue[MAX_TRIPS];
int tripCount = 0;
int tripIdCounter = 1;

// Control de tiempo para no enviar inmediatamente
unsigned long lastSyncTime = 0;
const unsigned long syncInterval = 10000; // Intenta sincronizar cada 10 seg si hay datos

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  // --- INICIALIZAR PANTALLA OLED ---
  // ESP32 por defecto I2C en SDA=21, SCL=22
  Wire.begin(21, 22); 
  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("Error: No se encontró pantalla OLED"));
    for(;;); // Detener si falla la pantalla
  }
  
  mostrarMensaje("Iniciando\nValidador...");
  
  // --- INICIALIZAR RFID ---
  SPI.begin(18, 19, 23, 5); // sck=18, miso=19, mosi=23, ss=5
  mfrc522.PCD_Init();
  Serial.println(F("Lector RFID inicializado"));

  // --- INICIALIZAR WIFI ---
  mostrarMensaje("Conectando\nWiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado.");
  
  mostrarMensaje("Listo!\nAcerque su\ntarjeta.");
}

void loop() {
  // 1. Validar si hay tarjetas presentes en el RFID
  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    
    // Convertir UUID de tarjeta a String
    String cardLeida = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
      cardLeida += String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : "");
      cardLeida += String(mfrc522.uid.uidByte[i], HEX);
    }
    cardLeida.toUpperCase(); // Ej: A1B2C3D4
    
    Serial.println("\n[NFC] Tarjeta leída: " + cardLeida);
    mostrarMensaje("Leyendo...\n" + cardLeida);
    
    // 2. Verificar Lista Negra
    bool isBlocked = false;
    for(int i=0; i<blacklistSize; i++) {
      if(cardLeida == String(blacklist[i])) {
        isBlocked = true;
        break;
      }
    }
    
    if(isBlocked) {
      Serial.println("[!] ERROR: Tarjeta en LISTA NEGRA.");
      mostrarMensaje("ERROR:\nTarjeta\nBloqueada!");
      delay(2000); // Dar tiempo a que el usuario lea
    } else {
      // 3. Registrar viaje válido
      if(tripCount < MAX_TRIPS) {
        String newTripId = "VIA-" + String(millis()) + "-" + String(tripIdCounter++);
        tripQueue[tripCount] = {newTripId, cardLeida, 1.20, "2026-10-04T12:00:00"};
        tripCount++;
        Serial.println("[OK] Viaje registrado.");
        mostrarMensaje("Viaje\nAceptado\n$1.20");
        delay(2000);
      } else {
        Serial.println("[!] Cola llena.");
        mostrarMensaje("Memoria\nLlena\nSincronizando");
        enviarLoteAlBackend();
      }
    }
    
    // Detener la lectura de la tarjeta actual (para que no la lea múltipes veces de golpe)
    mfrc522.PICC_HaltA();
    mostrarMensaje("Listo!\nAcerque su\ntarjeta.");
  }

  // 4. Sincronización en lotes automática
  if (tripCount > 0 && WiFi.status() == WL_CONNECTED) {
    // Sincronizar si hay 2 o más viajes, O si pasaron más de 10 segundos desde el último intento
    if (tripCount >= 2 || (millis() - lastSyncTime > syncInterval)) {
      lastSyncTime = millis();
      enviarLoteAlBackend();
      mostrarMensaje("Listo!\nAcerque su\ntarjeta.");
    }
  }
}

// Función auxiliar para imprimir en el OLED
void mostrarMensaje(String texto) {
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println(texto);
  display.display();
}

void enviarLoteAlBackend() {
  if(tripCount == 0) return;
  
  Serial.println("\n[SYNC] Preparando envío de lote al backend...");
  mostrarMensaje("Sincronizando\nDatos...");
  
  // Crear JSON
  StaticJsonDocument<1024> doc;
  doc["busId"] = busId;
  doc["claveId"] = claveId;
  
  JsonArray tripsArray = doc.createNestedArray("trips");
  for(int i=0; i<tripCount; i++) {
    JsonObject tripObj = tripsArray.createNestedObject();
    tripObj["tripId"] = tripQueue[i].tripId;
    tripObj["cardId"] = tripQueue[i].cardId;
    tripObj["fare"] = tripQueue[i].fare;
    tripObj["localTimestamp"] = tripQueue[i].localTimestamp;
  }
  
  String jsonPayloadSinFirma;
  serializeJson(doc, jsonPayloadSinFirma);
  
  // Firmar el payload
  String firmaBase64 = firmarCriptograficamente(jsonPayloadSinFirma);
  doc["firma"] = firmaBase64;
  
  String jsonPayloadFinal;
  serializeJson(doc, jsonPayloadFinal);
  
  Serial.println("[SYNC] Payload a enviar: " + jsonPayloadFinal);
  
  // POST
  HTTPClient http;
  http.begin(backendUrl);
  http.addHeader("Content-Type", "application/json");
  
  int httpResponseCode = http.POST(jsonPayloadFinal);
  
  if (httpResponseCode > 0) {
    Serial.print("[SYNC] HTTP Code: ");
    Serial.println(httpResponseCode);
    if(httpResponseCode == 200 || httpResponseCode == 201 || httpResponseCode == 202) {
      Serial.println("[SYNC] Éxito. Limpiando cola.");
      mostrarMensaje("Sincronizacion\nExitosa");
      tripCount = 0; 
      delay(1500);
    } else {
      mostrarMensaje("Error al\nSincronizar\nRed/Server");
      delay(2000);
    }
  } else {
    Serial.print("[SYNC] Error HTTP: ");
    Serial.println(http.errorToString(httpResponseCode).c_str());
    mostrarMensaje("Error\nConexion\nHTTP");
    delay(2000);
  }
  http.end();
}

String firmarCriptograficamente(String payload) {
  mbedtls_pk_context pk;
  mbedtls_entropy_context entropy;
  mbedtls_ctr_drbg_context ctr_drbg;
  
  mbedtls_pk_init(&pk);
  mbedtls_entropy_init(&entropy);
  mbedtls_ctr_drbg_init(&ctr_drbg);
  
  const char *pers = "esp32_signer";
  mbedtls_ctr_drbg_seed(&ctr_drbg, mbedtls_entropy_func, &entropy, (const unsigned char *)pers, strlen(pers));
  
  int ret = mbedtls_pk_parse_key(&pk, (const unsigned char*)private_key_pem, strlen(private_key_pem) + 1, NULL, 0, mbedtls_ctr_drbg_random, &ctr_drbg);
  if (ret != 0) return "";
  
  unsigned char hash[32];
  mbedtls_md(mbedtls_md_info_from_type(MBEDTLS_MD_SHA256), (const unsigned char*)payload.c_str(), payload.length(), hash);
  
  unsigned char sig[MBEDTLS_MPI_MAX_SIZE];
  size_t sig_len = 0;
  ret = mbedtls_pk_sign(&pk, MBEDTLS_MD_SHA256, hash, 0, sig, sizeof(sig), &sig_len, mbedtls_ctr_drbg_random, &ctr_drbg);
  if (ret != 0) return "";
  
  unsigned char base64_sig[256];
  size_t base64_len = 0;
  mbedtls_base64_encode(base64_sig, sizeof(base64_sig), &base64_len, sig, sig_len);
  
  String firmaBase64 = String((char*)base64_sig);
  
  mbedtls_pk_free(&pk);
  mbedtls_entropy_free(&entropy);
  mbedtls_ctr_drbg_free(&ctr_drbg);
  
  return firmaBase64;
}
