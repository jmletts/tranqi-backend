# US-07: Transferencia de Saldo Entre Cuentas del Mismo Usuario

## Descripción
**Como** usuario registrado con múltiples tarjetas administradas,  
**Quiero** transferir saldo desde una de mis tarjetas hacia otra de mis tarjetas,  
**Para** redistribuir mis fondos de viaje de manera autónoma entre mis tarjetas familiares o personales.

---

## Reglas de Negocio

1. **Titularidad Compartida Obligatoria:**
   - La tarjeta de origen y la tarjeta de destino deben estar vinculadas al **mismo `usuarioId`**.
   - No se permiten transferencias hacia o desde tarjetas anónimas (`usuarioId == null`).
   - No se permiten transferencias entre tarjetas que pertenezcan a usuarios distintos.
2. **Disponibilidad de Saldo en Origen:**
   - Solo se puede transferir saldo positivo real disponible.
   - El saldo resultante en la cuenta de origen no puede quedar en negativo ni por debajo de `0.00` tras la transferencia. No se permite transferir usando el margen de deuda.
3. **Monto Estrictamente Positivo:** El monto a transferir debe ser mayor a cero (`monto > 0.00`).
4. **Respeto a Límites y Estado en Destino:**
   - Si la tarjeta destino posee saldo negativo (deuda acumulada), el saldo transferido amortiza primeramente la deuda. Si el saldo final de la cuenta destino resulta mayor a cero, y la tarjeta destino estaba en `BLOCKED_DEUDA`, se reactiva a `ACTIVE`.
   - La cuenta destino no puede exceder el límite máximo de saldo configurado para una cuenta del sistema (`SALDO_MAXIMO_CUENTA = 200.00`).
5. **Restricción de Bloqueos:** Ni la tarjeta de origen ni la tarjeta de destino pueden estar en estado `BLOCKED_FRAUDE` o `BLOCKED_PERDIDA`.

---

## Fuera de Alcance (Out of Scope)

- Transferencias de saldo hacia tarjetas pertenecientes a otros usuarios (sistema P2P interusuarios).
- Transferencias hacia billeteras bancarias o cuentas corrientes externas.

---

## Criterios de Aceptación

- [ ] El usuario `USR-301` transfiere 15.00 desde su tarjeta `TRK-7001` (saldo 50.00) hacia su tarjeta `TRK-7002` (saldo 10.00): el saldo de `CTA-701` queda en 35.00 y el de `CTA-702` en 25.00.
- [ ] La transferencia es rechazada si la cuenta origen no cuenta con suficiente saldo para cubrir el monto solicitado.
- [ ] La transferencia es rechazada si la tarjeta destino pertenece a otro usuario (`USR-302`).
- [ ] La transferencia es rechazada si la tarjeta de origen o destino es anónima.
- [ ] Si la tarjeta destino estaba en `BLOCKED_DEUDA` y el saldo recibido salda la deuda quedando saldo positivo, la tarjeta destino pasa a estado `ACTIVE`.
- [ ] La transferencia es rechazada si el monto a transferir supera el saldo máximo admisible en la cuenta destino.
