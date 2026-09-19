# US-10: Sincronización Idempotente de Lotes de Viajes

## Descripción
**Como** sistema backend central de Tranki,  
**Quiero** procesar lotes de registros de viajes transmitidos por los validadores físicos cuando recuperan conectividad,  
**Para** consolidar los viajes realizados, conciliar los saldos de las cuentas y detectar deudas o inconsistencias de forma idempotente y resiliente.

---

## Reglas de Negocio

1. **Idempotencia Estricta:**
   - Cada registro de viaje transmitido contiene un identificador único global (`identificadorViaje` con formato `VIA-XXX` o UUID emitido por el validador) y el identificador del validador (`BUS-XXX`).
   - Si el backend recibe un identificador de viaje que ya fue procesado con anterioridad, dicho registro es ignorado sin volver a debitar saldo ni duplicar estadísticas.
2. **Conciliación Contable con la Cuenta (1:1):**
   - Por cada viaje nuevo válido, el sistema debita el costo del pasaje en la `Cuenta` asociada a la tarjeta (`TRK-XXXX`).
3. **Transición Automática a Deuda:**
   - Si tras conciliar el viaje el saldo en el backend resulta negativo (`saldo < 0.00`) o excede el límite operativo, la tarjeta pasa a estado `BLOCKED_DEUDA`.
   - Se agenda la inclusión de la tarjeta en la Lista Negra para ser difundida a todos los buses de la flota.
4. **Tolerancia a Fallos Parciales en el Lote:**
   - El lote se procesa elemento por elemento o de forma transaccional tolerante: si un viaje hace referencia a una tarjeta inexistente o corrupta, se marca como anomalía/rechazado en la auditoría sin abortar el resto de viajes válidos del lote.
5. **Confirmación de Sincronización:**
   - El backend responde al validador con un acuse de recibo (`ACK`) detallando la cantidad de viajes aceptados, duplicados omitidos y errores, permitiendo al validador purgar su memoria local con seguridad.

---

## Fuera de Alcance (Out of Scope)

- Protocolos de bajo nivel de enlace de radio (Wi-Fi 802.11 / módem 4G LTE).
- Georreferenciación cartográfica en tiempo real de la ruta del bus.

---

## Criterios de Aceptación

- [ ] Se recibe un lote con viajes `VIA-1001` y `VIA-1002` desde el bus `BUS-201`: el backend debita los montos en las cuentas respectivas y retorna respuesta de éxito.
- [ ] Si se reenvía el mismo lote con `VIA-1001` y `VIA-1002`, el sistema detecta ambos como duplicados y no vuelve a debitar ningún saldo.
- [ ] Si un viaje `VIA-1003` deja la cuenta `CTA-203` en saldo negativo -2.50, la tarjeta asociada pasa a estado `BLOCKED_DEUDA` y se encola para lista negra.
- [ ] Si un viaje contiene una tarjeta inexistente `TRK-9999`, el backend registra el error y procesa el resto de viajes válidos del lote.
