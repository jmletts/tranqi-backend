# US-05: Bloqueo de Tarjeta por Fraude

## Descripción
**Como** oficial de seguridad o administrador del sistema,  
**Quiero** bloquear administrativamente una tarjeta identificada en actividades sospechosas o clonación,  
**Para** revocar su capacidad de viaje y recarga de forma permanente sin que pueda reactivarse mediante pagos.

---

## Reglas de Negocio

1. **Transición a Estado `BLOCKED_FRAUDE`:** La tarjeta señalada pasa al estado irreversible `BLOCKED_FRAUDE`.
2. **Inmunidad a Recargas:** A diferencia del bloqueo por deuda (`BLOCKED_DEUDA`), el estado `BLOCKED_FRAUDE` **nunca** se revierte mediante abonos de saldo o recargas en kiosco/pasarela. Cualquier intento de recarga hacia una tarjeta en este estado debe ser rechazado.
3. **Inclusión Inmediata en Lista Negra:** La tarjeta debe registrarse para difusión prioritaria a los validadores locales (ESP32) mediante publicación de evento inmediato.
4. **Denegación de Transferencias:** No se permite que una tarjeta en estado `BLOCKED_FRAUDE` emita ni reciba transferencias de saldo entre tarjetas.
5. **Irreversibilidad Operativa Ordinaria:** Solo una auditoría administrativa especial puede desmarcar una tarjeta por falso positivo (fuera del flujo transaccional habitual).

---

## Fuera de Alcance (Out of Scope)

- Detección automática algorítmica de anomalías por machine learning (se recibe la orden de bloqueo decidida por el sistema antifraude o auditor).
- Notificación legal al portador del plástico.

---

## Criterios de Aceptación

- [ ] Un administrador bloquea exitosamente una tarjeta activa `TRK-5001` con motivo "Sospecha de clonación NFC", cambiando su estado a `BLOCKED_FRAUDE`.
- [ ] La tarjeta `TRK-5001` es despachada a la lista negra con alta prioridad.
- [ ] Un intento posterior de recarga sobre la tarjeta en estado `BLOCKED_FRAUDE` es rechazado terminantemente.
- [ ] Si la tarjeta ya está en estado `BLOCKED_FRAUDE`, la operación es idempotente o informa que ya se encuentra bloqueada por fraude.
