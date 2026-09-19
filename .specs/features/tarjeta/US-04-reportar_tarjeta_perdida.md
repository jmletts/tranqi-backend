# US-04: Reporte de Tarjeta Perdida o Robada y Reemplazo

## Descripción
**Como** usuario titular de una tarjeta de transporte,  
**Quiero** reportar la pérdida o robo de mi tarjeta actual y solicitar una de reemplazo,  
**Para** revocar inmediatamente el acceso al plástico extraviado y transferir íntegramente mi saldo y beneficios a una nueva tarjeta física.

---

## Reglas de Negocio

1. **Bloqueo Terminal de la Tarjeta Extraviada:**
   - La tarjeta reportada cambia de inmediato a estado irreversible `BLOCKED_PERDIDA`.
   - Se publica automáticamente en la Lista Negra para su distribución urgente a los validadores.
   - Una tarjeta en estado `BLOCKED_PERDIDA` nunca podrá reactivarse ni recibir recargas.
2. **Asignación de Tarjeta de Reemplazo:**
   - Se toma una tarjeta física existente en estado `EN_INVENTARIO` para ser asignada como reemplazo.
   - La nueva tarjeta pasa a estado `ACTIVE`.
3. **Herencia Obligatoria de Datos:**
   - **`usuarioId`:** La nueva tarjeta hereda exactamente el mismo `usuarioId` del titular.
   - **Categoría Tarifaria:** La nueva tarjeta hereda la categoría tarifaria de la tarjeta perdida (ej. `ESTUDIANTE`, `ADULTO_MAYOR`, `GENERAL`).
   - **`cuentaId` (Saldo):** La nueva tarjeta pasa a ser la propietaria exclusiva de la **misma `cuentaId`** que tenía la tarjeta anterior, conservando intacto su saldo acumulado (o deuda).
4. **Rechazo en Tarjetas Anónimas:** No se puede reportar pérdida digital si la tarjeta es anónima (`usuarioId == null`), dado que no es posible acreditar la titularidad del reclamo.
5. **Rechazo si ya está bloqueada terminalmente:** Si la tarjeta ya se encuentra en `BLOCKED_PERDIDA` o `BLOCKED_FRAUDE`, la solicitud es rechazada.

---

## Fuera de Alcance (Out of Scope)

- Cobro administrativo por reposición de plástico.
- Localización geográfica de la tarjeta extraviada.

---

## Criterios de Aceptación

- [ ] Al reportar la pérdida de la tarjeta `TRK-4001` perteneciente al usuario `USR-201`, la tarjeta `TRK-4001` pasa al estado `BLOCKED_PERDIDA`.
- [ ] La nueva tarjeta `TRK-4002` (previamente `EN_INVENTARIO`) se activa y hereda el `usuarioId` (`USR-201`), la categoría tarifaria y la misma `cuentaId` con su saldo original.
- [ ] La tarjeta extraviada `TRK-4001` se incluye en la cola de distribución de Lista Negra.
- [ ] Si se intenta reportar pérdida sobre una tarjeta anónima, la operación es rechazada requiriendo titularidad previa.
- [ ] Si la tarjeta ya estaba en estado `BLOCKED_PERDIDA`, la operación se rechaza por reporte duplicado.
