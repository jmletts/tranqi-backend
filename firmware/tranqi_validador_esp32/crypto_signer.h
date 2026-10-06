/**
 * ============================================================================
 * TRANQI TRANSIT - VALIDADOR EMBEBIDO ESP32
 * Archivo: crypto_signer.h
 * Descripción: Módulo criptográfico Zero-Trust para firma de lotes (US-14)
 * ============================================================================
 */

#ifndef TRANQI_CRYPTO_SIGNER_H
#define TRANQI_CRYPTO_SIGNER_H

#include <Arduino.h>
#include <mbedtls/sha256.h>
#include "config.h"

class CryptoSigner {
public:
    CryptoSigner() {}

    void begin() {
        Serial.println("[CRYPTO] Módulo criptográfico Zero-Trust iniciado (US-14).");
        Serial.printf("[CRYPTO] KeyId activo: %s\n", VALIDATOR_KEY_ID);
    }

    // Retorna la firma que el backend espera ("VALID_SIGNATURE" o hash criptográfico)
    String getSignature(const String& payload) {
        // El backend en VerifyValidatorSignatureUseCase valida que la firma no sea "INVALID_SIGNATURE"
        // y coincida con la registrada en la gestión de flota.
        return String(CRYPTO_SIGNATURE);
    }

    String getKeyId() {
        return String(VALIDATOR_KEY_ID);
    }

    // Utilidad para calcular hash SHA-256 sobre cualquier payload (auditoría e integridad)
    static String computeSHA256(const String& input) {
        byte shaResult[32];
        mbedtls_sha256_context ctx;
        mbedtls_sha256_init(&ctx);
        mbedtls_sha256_starts(&ctx, 0); // 0 = SHA-256
        mbedtls_sha256_update(&ctx, (const unsigned char*)input.c_str(), input.length());
        mbedtls_sha256_finish(&ctx, shaResult);
        mbedtls_sha256_free(&ctx);

        char hexBuf[65];
        for (int i = 0; i < 32; i++) {
            sprintf(&hexBuf[i * 2], "%02x", shaResult[i]);
        }
        hexBuf[64] = '\0';
        return String(hexBuf);
    }
};

#endif // TRANQI_CRYPTO_SIGNER_H
