/**
 * ============================================================================
 * TRANQI TRANSIT - VALIDADOR EMBEBIDO ESP32
 * Archivo: card_manager.h
 * Descripción: Registro y balance local de tarjetas inteligentes
 * Implementa US-01 (Emisión), US-02 (Categoría), US-03 (Configuración) y US-06 (Recarga)
 * ============================================================================
 */

#ifndef TRANQI_CARD_MANAGER_H
#define TRANQI_CARD_MANAGER_H

#include <Arduino.h>
#include "config.h"

enum FareCategoryEnum {
    CAT_GENERAL,
    CAT_SCHOOL,
    CAT_UNIVERSITY
};

struct CardData {
    String cardId;
    FareCategoryEnum category;
    float balance;
    bool registered;
};

#define MAX_MANAGED_CARDS 64

class CardManager {
private:
    CardData cards[MAX_MANAGED_CARDS];
    int count = 0;

public:
    CardManager() {}

    void begin() {
        // Cargar tarjetas de prueba de las especificaciones BDD oficiales
        registerCard("TRK-001", CAT_GENERAL, 10.00f);
        registerCard("TRK-9001", CAT_GENERAL, 10.00f);
        registerCard("TRK-9002", CAT_GENERAL, 1.00f);   // Dejará saldo en -0.20 (viaje a crédito)
        registerCard("TRK-9003", CAT_GENERAL, -4.50f);  // Con tarifa 1.20 pasará a -5.70 (excede -5.00)
        registerCard("TRK-SCHOOL", CAT_SCHOOL, 5.00f);  // Tarifa 0.60
        registerCard("TRK-UNIV", CAT_UNIVERSITY, 5.00f);// Tarifa 0.60

        Serial.printf("[CARDS] Gestor de tarjetas iniciado con %d tarjetas base.\n", count);
    }

    bool registerCard(const String& cardId, FareCategoryEnum category, float initialBalance) {
        for (int i = 0; i < count; i++) {
            if (cards[i].cardId.equalsIgnoreCase(cardId)) {
                cards[i].category = category;
                cards[i].balance = initialBalance;
                cards[i].registered = true;
                return true;
            }
        }

        if (count < MAX_MANAGED_CARDS) {
            cards[count].cardId = cardId;
            cards[count].category = category;
            cards[count].balance = initialBalance;
            cards[count].registered = true;
            count++;
            return true;
        }
        return false;
    }

    // Obtener tarjeta o auto-registrar según US-01 si es la primera vez que se presenta
    CardData* getOrCreateCard(const String& cardId) {
        for (int i = 0; i < count; i++) {
            if (cards[i].cardId.equalsIgnoreCase(cardId)) {
                return &cards[i];
            }
        }

        // US-01: Auto-emisión / registro de tarjeta física con valores por defecto GENERAL
        if (count < MAX_MANAGED_CARDS) {
            cards[count].cardId = cardId;
            cards[count].category = CAT_GENERAL;
            cards[count].balance = SALDO_INICIAL_GENERAL; // S/ 5.00
            cards[count].registered = true;
            Serial.printf("[CARDS] Tarjeta nueva autodetectada y registrada (US-01): %s con saldo S/ %.2f\n",
                          cardId.c_str(), SALDO_INICIAL_GENERAL);
            return &cards[count++];
        }

        return nullptr;
    }

    // US-02: Cambiar categoría tarifaria
    bool setCategory(const String& cardId, FareCategoryEnum category) {
        CardData* c = getOrCreateCard(cardId);
        if (c != nullptr) {
            c->category = category;
            Serial.printf("[CARDS] Categoría actualizada para %s: %s\n", 
                          cardId.c_str(), getCategoryName(category));
            return true;
        }
        return false;
    }

    // US-06: Confirmar recarga (aumentar saldo)
    bool recharge(const String& cardId, float amount) {
        CardData* c = getOrCreateCard(cardId);
        if (c != nullptr) {
            c->balance += amount;
            Serial.printf("[CARDS] Recarga aplicada a %s: +S/ %.2f -> Nuevo Saldo: S/ %.2f\n",
                          cardId.c_str(), amount, c->balance);
            return true;
        }
        return false;
    }

    // Obtener tarifa según categoría (US-09 y domain-rules.md)
    float getFare(FareCategoryEnum category) const {
        switch (category) {
            case CAT_SCHOOL:
                return TARIFA_SCHOOL;       // S/ 0.60
            case CAT_UNIVERSITY:
                return TARIFA_UNIVERSITY;   // S/ 0.60
            case CAT_GENERAL:
            default:
                return TARIFA_GENERAL;      // S/ 1.20
        }
    }

    const char* getCategoryName(FareCategoryEnum category) const {
        switch (category) {
            case CAT_SCHOOL:     return "SCHOOL";
            case CAT_UNIVERSITY: return "UNIVERSITY";
            case CAT_GENERAL:
            default:             return "GENERAL";
        }
    }

    int getCount() const { return count; }
    const CardData* getCard(int index) const {
        return (index >= 0 && index < count) ? &cards[index] : nullptr;
    }

    void printCards() {
        Serial.println("--- TARJETAS REGISTRADAS EN VALIDADOR ---");
        for (int i = 0; i < count; i++) {
            Serial.printf(" [%02d] %s | Cat: %s | Saldo: S/ %.2f\n",
                          i + 1, cards[i].cardId.c_str(),
                          getCategoryName(cards[i].category), cards[i].balance);
        }
        Serial.println("-----------------------------------------");
    }
};

#endif // TRANQI_CARD_MANAGER_H
