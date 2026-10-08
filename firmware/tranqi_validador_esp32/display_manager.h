/**
 * ============================================================================
 * TRANQI TRANSIT - VALIDADOR EMBEBIDO ESP32
 * Archivo: display_manager.h
 * Descripción: Manejador gráfico de la pantalla OLED SSD1306 (128x64 I2C)
 * Implementa las pantallas de US-09, US-10 y estados de espera
 * ============================================================================
 */

#ifndef TRANQI_DISPLAY_MANAGER_H
#define TRANQI_DISPLAY_MANAGER_H

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "config.h"

class DisplayManager {
private:
    Adafruit_SSD1306 display;
    unsigned long messageUntil = 0;
    bool showingTemporaryMessage = false;

    void drawTopStatusBar(bool wifiConnected, int pendingTrips) {
        // Franja superior invertida
        display.fillRect(0, 0, OLED_SCREEN_WIDTH, 11, SSD1306_WHITE);
        display.setTextColor(SSD1306_BLACK, SSD1306_WHITE);
        display.setTextSize(1);
        display.setCursor(2, 2);
        display.print("TRANQI");

        // Estado Wi-Fi
        display.setCursor(50, 2);
        if (wifiConnected) {
            display.print("WIFI:ON");
        } else {
            display.print("OFFLINE");
        }

        // Lotes pendientes en cola
        display.setCursor(98, 2);
        display.printf("Q:%d", pendingTrips);

        display.setTextColor(SSD1306_WHITE);
    }

public:
    DisplayManager() : display(OLED_SCREEN_WIDTH, OLED_SCREEN_HEIGHT, &Wire, OLED_RESET_PIN) {}

    bool begin() {
        Wire.begin(OLED_SDA_PIN, OLED_SCL_PIN);
        if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_I2C_ADDRESS)) {
            Serial.println("[OLED] Error al inicializar pantalla SSD1306.");
            return false;
        }
        display.clearDisplay();
        display.display();
        Serial.println("[OLED] Pantalla SSD1306 lista en I2C (SDA 21, SCL 22).");
        return true;
    }

    void showBootScreen() {
        display.clearDisplay();
        display.setTextSize(1);
        display.setTextColor(SSD1306_WHITE);
        display.setCursor(18, 10);
        display.println("TRANQI TRANSIT");
        display.drawFastHLine(10, 22, 108, SSD1306_WHITE);
        
        display.setCursor(15, 28);
        display.println("Validador IoT v1.0");
        display.setCursor(10, 40);
        display.printf("Unidad: %s\n", BUS_ID);
        display.setCursor(22, 52);
        display.println("Iniciando MFRC522...");
        display.display();
    }

    void showIdleScreen(bool wifiConnected, int pendingTrips, const char* busId) {
        if (showingTemporaryMessage && millis() < messageUntil) {
            return; // Continúa mostrando el resultado de la tarjeta
        }
        showingTemporaryMessage = false;

        display.clearDisplay();
        drawTopStatusBar(wifiConnected, pendingTrips);

        // Identificador del Bus
        display.setTextSize(1);
        display.setCursor(4, 15);
        display.printf("Unidad: %s", busId);

        // Recuadro central de llamado a la acción
        display.drawRoundRect(4, 26, 120, 22, 3, SSD1306_WHITE);
        display.setTextSize(1);
        display.setCursor(12, 33);
        display.print(">> ACERQUE TARJETA <<");

        // Tarifario rápido en el pie
        display.setTextSize(1);
        display.setCursor(4, 52);
        display.printf("GEN:1.20 | ESC/UNI:0.60");

        display.display();
    }

    // Pantalla de autorización (US-09)
    void showAuthorized(const String& cardId, const char* category, float fare, float newBalance, bool wasDebtTrip) {
        showingTemporaryMessage = true;
        messageUntil = millis() + DISPLAY_RESULT_TIME_MS;

        display.clearDisplay();

        // Banner superior
        display.fillRect(0, 0, OLED_SCREEN_WIDTH, 14, SSD1306_WHITE);
        display.setTextColor(SSD1306_BLACK, SSD1306_WHITE);
        display.setTextSize(1);
        display.setCursor(10, 3);
        display.print("[ VIAJE AUTORIZADO ]");

        display.setTextColor(SSD1306_WHITE);
        display.setCursor(4, 18);
        display.printf("ID: %s (%s)", cardId.c_str(), category);

        display.setCursor(4, 30);
        display.printf("Cobro: -S/ %.2f", fare);

        display.setCursor(4, 42);
        display.printf("Saldo: S/ %.2f", newBalance);

        // Pie de página o advertencia de deuda
        display.setCursor(4, 54);
        if (wasDebtTrip) {
            display.print("* VIAJE A CREDITO *");
        } else {
            display.print("   ¡BUEN VIAJE!");
        }

        display.display();
    }

    // Pantalla de rechazo (US-09)
    void showRejected(const String& cardId, const char* reason, float balance) {
        showingTemporaryMessage = true;
        messageUntil = millis() + DISPLAY_RESULT_TIME_MS;

        display.clearDisplay();

        // Banner superior invertido de alerta
        display.fillRect(0, 0, OLED_SCREEN_WIDTH, 14, SSD1306_WHITE);
        display.setTextColor(SSD1306_BLACK, SSD1306_WHITE);
        display.setTextSize(1);
        display.setCursor(14, 3);
        display.print("[ ACCESO DENEGADO ]");

        display.setTextColor(SSD1306_WHITE);
        display.setCursor(4, 18);
        display.printf("ID: %s", cardId.c_str());

        display.setTextSize(1);
        display.setCursor(4, 30);
        display.printf("Motivo: %s", reason);

        display.setCursor(4, 42);
        display.printf("Saldo actual: S/ %.2f", balance);

        display.setCursor(4, 54);
        display.print(">> RECARGUE SALDO <<");

        display.display();
    }

    // Pantalla de sincronización por lotes (US-10)
    void showSyncStatus(int tripsCount, bool success, int httpCode) {
        showingTemporaryMessage = true;
        messageUntil = millis() + 1800;

        display.clearDisplay();
        display.fillRect(0, 0, OLED_SCREEN_WIDTH, 14, SSD1306_WHITE);
        display.setTextColor(SSD1306_BLACK, SSD1306_WHITE);
        display.setTextSize(1);
        display.setCursor(8, 3);
        display.print("[ SYNC EN PROCESO ]");

        display.setTextColor(SSD1306_WHITE);
        display.setCursor(4, 22);
        display.printf("Lote: %d viajes", tripsCount);

        display.setCursor(4, 36);
        if (success) {
            display.printf("Backend ACK: %d OK", httpCode);
            display.setCursor(4, 50);
            display.print("Lote conciliado");
        } else {
            display.printf("Fallo HTTP: %d", httpCode);
            display.setCursor(4, 50);
            display.print("Reintentando despues");
        }

        display.display();
    }

    void resetToIdle() {
        showingTemporaryMessage = false;
        messageUntil = 0;
    }
};

#endif // TRANQI_DISPLAY_MANAGER_H
