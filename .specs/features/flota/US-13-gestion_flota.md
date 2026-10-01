# US-13: Gestión de Flota

## Descripción
**Como** Gestor de Flota,  
**Quiero** registrar buses, asignarles identificadores de hardware (ESP32) y consultar las ganancias de la flota,  
**Para** mantener el control operativo y auditar qué validador está autorizado a cobrar en nombre de qué bus.

---

## Análisis DDD (Domain-Driven Design)
* **Agregado Raíz (Aggregate Root):** `Bus`.
* **Entidades:** `FleetEarnings` (Proyección de lectura).
* **Objetos de Valor (Value Objects):** 
  - `LicensePlate` (Placa única del bus).
  - `HardwareId` (MAC del ESP32).
  - `PublicKey` (Clave pública ECDSA del validador para verificar firmas).
* **Reglas de Invariancia:**
  - `LicensePlate` debe ser unique.
  - `HardwareId` no puede estar duplicado en dos buses activos.

---

## Reglas de Negocio
1. **Registro de Bus:** Solo usuarios con rol `GESTOR_FLOTA` pueden registrar un bus.
2. **Vinculación de Hardware:** Al registrar el bus, se debe proveer la `PublicKey` del ESP32 (Elemento seguro dedicado ATECC608A) instalado.
3. **Consulta de Ganancias:** El Gestor de Flota puede consultar el total recaudado por cada placa en un periodo determinado (basado en los viajes procesados).
4. **Validación Criptográfica:** Todo lote de viajes enviado al backend debe venir firmado asimétricamente por el ESP32. El backend verificará la firma usando la `PublicKey` asociada al `HardwareId`. Si el hardware no existe o la firma es inválida, el lote entero se rechaza con un error HTTP 403.
