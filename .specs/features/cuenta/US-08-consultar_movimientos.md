# US-08: Consulta de Movimientos de Tarjeta

## Descripción
**Como** usuario registrado en el sistema,  
**Quiero** consultar el historial cronológico de movimientos (viajes y recargas) de mis tarjetas vinculadas,  
**Para** supervisar los cobros realizados, verificar mis abonos y controlar mis gastos de transporte.

---

## Reglas de Negocio

1. **Titularidad Obligatoria:**
   - Un usuario solo puede consultar el historial de movimientos de tarjetas que tengan asignado su propio `usuarioId`.
   - Si se solicita el historial de una tarjeta asociada a otro usuario, la petición debe responder con acceso no autorizado o denegado.
2. **Restricción sobre Tarjetas Anónimas:**
   - No se permite consultar el historial de movimientos de tarjetas anónimas (`usuarioId == null`) a través de la API de usuario. (Los movimientos de tarjetas anónimas solo son auditables en taquilla física presentando el plástico).
3. **Composición del Historial:**
   - El historial unifica en orden cronológico descendente:
     - **Recargas:** identificadas con `TRX-XXX`, fecha/hora, monto acreditado y canal de recarga.
     - **Viajes:** identificados con `VIA-XXX` o el ID del lote sincronizado, fecha/hora, línea o bus `BUS-XXX`, tarifa cobrada y saldo resultante.
     - **Transferencias:** débito o crédito entre tarjetas del mismo usuario.
4. **Paginación y Rango de Fechas:** La consulta debe soportar paginación y filtros opcionales por rango de fechas (máximo 90 días históricos).

---

## Fuera de Alcance (Out of Scope)

- Consulta directa desde lectores NFC de teléfonos sin estar autenticado.
- Emisión de comprobantes fiscales electrónicos descargables.

---

## Criterios de Aceptación

- [ ] El usuario `USR-401` consulta los movimientos de su tarjeta vinculada `TRK-8001` y recibe la lista ordenada con sus recargas y viajes validados.
- [ ] Si el usuario `USR-401` intenta consultar los movimientos de la tarjeta `TRK-8002` perteneciente a `USR-402`, la consulta es rechazada por falta de autorización.
- [ ] Si el usuario `USR-401` intenta consultar una tarjeta anónima `TRK-8003`, la consulta es rechazada por ser tarjeta anónima.
- [ ] La consulta devuelve la cuenta asociada `CTA-801` y su saldo actual al momento de la consulta.
