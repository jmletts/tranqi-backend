# US-14: Verificación Criptográfica Zero-Trust Bidireccional (ESP32 <-> Backend)

## Descripción
**Como** plataforma central Tranki,  
**Quiero** establecer un canal de confianza cero (Zero-Trust) basado en firmas criptográficas asimétricas (ECDSA) en ambas direcciones,  
**Para** evitar que atacantes simulen cobros de viajes hacia el servidor o envíen listas negras falsas al hardware en campo.

---

## Análisis DDD (Domain-Driven Design)
* **Dominio Afectado:** `Trip` (Lotes entrantes), `Fleet` (Claves públicas) y `Blacklist` (Actualizaciones salientes).
* **Servicios de Dominio (Domain Services):** 
  - `TripSignatureValidatorService`: Verifica firmas de lotes de viajes.
  - `BlacklistSignatureGeneratorService`: Genera firmas para las actualizaciones de listas negras.
* **Reglas de Invariancia:**
  - Todo payload entrante a `/api/v1/trips/batch` debe incluir una `signature` y `keyId`.
  - Toda publicación de lista negra hacia los validadores debe incluir una firma del backend generada con la Llave Privada Maestra del Servidor.

---

## Reglas de Negocio
1. **Firma de Viajes (Hardware ➔ Backend):** El ESP32 firma el JSON (`busId` + `trips`) con su clave privada interna (ATECC608A). Si la firma no corresponde matemáticamente a la `PublicKey` vinculada al bus, el lote COMPLETO se rechaza con error `401 Unauthorized`. Ningún viaje se procesa.
2. **Firma de Lista Negra (Backend ➔ Hardware):** El Backend firma el payload de actualización de la lista negra con la Clave Privada del Servidor. El ESP32 utilizará la Clave Pública del Servidor para verificarla antes de guardarla localmente, rechazando cualquier actualización maliciosa o vacía que no posea la firma correcta.
