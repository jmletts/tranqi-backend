# US-06: Confirmación de Recarga de Saldo

## Descripción
**Como** sistema de recaudo (kiosco físico o pasarela de notificaciones bancarias),  
**Quiero** confirmar la acreditación de saldo en la cuenta asociada a una tarjeta de transporte,  
**Para** incrementar el saldo disponible del pasajero y levantar automáticamente bloqueos por deuda si el saldo resultante es positivo.

---

## Reglas de Negocio

1. **Canales Autorizados:** La recarga debe originarse exclusivamente de terminales físicos autorizados (**kioscos**) o mediante webhook firmado de **pasarelas de notificación bancaria**. No se aceptan recargas originadas por aplicaciones móviles.
2. **Identificador Único de Transacción:** Cada evento de recarga debe contener un identificador único (`TRX-XXX`) para garantizar la **idempotencia** (si la misma transacción se reenvía, no debe duplicar el saldo).
3. **Monto Válido:** El monto a recargar debe ser un valor monetario estrictamente mayor a cero (`monto > 0.00`).
4. **Desbloqueo Automático por Deuda:**
   - Si la tarjeta asociada se encontraba en estado `BLOCKED_DEUDA` y el saldo posterior a la recarga es estrictamente mayor a cero (`saldo > 0.00`), la tarjeta pasa automáticamente a estado `ACTIVE`.
   - Se debe emitir una orden de remoción de lista negra para dicha tarjeta.
   - Si tras la recarga el saldo continúa siendo negativo (debido a deuda pendiente muy alta), la tarjeta permanece en `BLOCKED_DEUDA`.
5. **Rechazo por Bloqueos No Recuperables:**
   - Si la tarjeta se encuentra en estado `BLOCKED_FRAUDE`, la recarga es rechazada sin modificar el saldo.
   - Si la tarjeta se encuentra en estado `BLOCKED_PERDIDA`, la recarga es rechazada.
   - Si la tarjeta se encuentra en estado `EN_INVENTARIO`, la recarga es rechazada.

---

## Fuera de Alcance (Out of Scope)

- Manejo de flujo de pasarela de pago para captura de tarjetas de crédito o débito bancarias de usuarios finales.
- Recargas iniciadas desde aplicaciones móviles de pasajeros.

---

## Criterios de Aceptación

- [ ] Se procesa una recarga de 15.00 con `TRX-601` desde kiosco sobre una tarjeta activa `TRK-6001` con saldo 5.00, resultando en saldo final de 20.00.
- [ ] Una tarjeta `TRK-6002` en estado `BLOCKED_DEUDA` con saldo -4.00 recibe recarga de 10.00 con `TRX-602`: el saldo pasa a 6.00 y la tarjeta pasa automáticamente a estado `ACTIVE`.
- [ ] Una tarjeta `TRK-6003` en estado `BLOCKED_DEUDA` con saldo -15.00 recibe recarga de 5.00: el saldo pasa a -10.00 y la tarjeta permanece en `BLOCKED_DEUDA`.
- [ ] Si se procesa dos veces el mismo identificador de recarga `TRX-601`, el sistema responde exitosamente de forma idempotente sin duplicar el abono.
- [ ] Una recarga sobre tarjeta en estado `BLOCKED_FRAUDE` es rechazada.
