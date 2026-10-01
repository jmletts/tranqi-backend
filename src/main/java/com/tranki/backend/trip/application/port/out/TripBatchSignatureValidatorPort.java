package com.tranki.backend.trip.application.port.out;

public interface TripBatchSignatureValidatorPort {
    /**
     * Valida matemáticamente que la firma corresponda a la clave pública asociada al busId (hardwareId).
     * @param busId El identificador del hardware (MAC del ESP32).
     * @param payload El JSON original del lote de viajes.
     * @param signature La firma criptográfica.
     * @throws SecurityException si el hardware es desconocido o la firma es inválida.
     */
    void validateSignature(String busId, String payload, String signature);
}
