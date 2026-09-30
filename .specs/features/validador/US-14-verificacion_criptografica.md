# US-14: Verificación Criptográfica Zero-Trust (ESP32)

## Descripción
**Como** plataforma central Tranki,  
**Quiero** exigir una firma criptográfica asimétrica (ECDSA) en los lotes de viajes enviados por los validadores,  
**Para** evitar que atacantes simulen cobros mediante la extracción de credenciales MQTT/HTTP del hardware en campo.

---

## Análisis DDD (Domain-Driven Design)
* **Dominio Afectado:** `Trip` (Procesamiento de lotes) interactuando con `Fleet` (Claves públicas).
* **Servicio de Dominio (Domain Service):** `TripSignatureValidatorService`.
* **Reglas de Invariancia:**
  - Todo payload entrante a `/api/v1/trips/batch` debe incluir `firma` y `claveId`.
  - La verificación ocurre **antes** de cualquier operación de base de datos o lógica de idempotencia.

---

## Reglas de Negocio
1. **Firma Asimétrica:** El ESP32 firma el JSON (`busId` + `trips`) con su clave privada interna (idealmente desde un Secure Element ATECC608A).
2. **Rechazo Absoluto:** Si la firma no corresponde matemáticamente a la `PublicKey` vinculada al bus, el lote COMPLETO se rechaza con error `401 Unauthorized`. Ningún viaje se procesa.
