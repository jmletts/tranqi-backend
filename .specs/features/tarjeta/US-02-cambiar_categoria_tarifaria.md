# US-02: Cambio de Categoría Tarifaria de Tarjeta

## Descripción
**Como** usuario o administrador del sistema de transporte,  
**Quiero** actualizar la categoría tarifaria de una tarjeta activa presentando la documentación correspondiente,  
**Para** acceder al beneficio o ajuste tarifario aplicable a mi condición actual.

---

## Reglas de Negocio

1. **Estado Operativo Requerido:** La tarjeta debe encontrarse en estado `ACTIVE` para permitir el cambio de categoría.
2. **Rechazo por Bloqueos:**
   - Si la tarjeta se encuentra en estado `BLOCKED_FRAUDE`, la solicitud se rechaza terminantemente.
   - Si la tarjeta se encuentra en estado `BLOCKED_PERDIDA`, la solicitud se rechaza terminantemente.
   - Si la tarjeta está en `BLOCKED_DEUDA`, se debe liquidar la deuda antes o rechazar el cambio tarifario hasta que su saldo sea no negativo.
3. **Validación Obligatoria de Documento de Soporte:**
   - Para cambiar a categoría `ESTUDIANTE`, se debe proveer y validar un documento de acreditación académica vigente.
   - Para cambiar a categoría `ADULTO_MAYOR`, se debe validar un documento oficial que verifique la edad mínima (≥ 65 años).
   - Para cambiar a categoría `GENERAL`, no se requiere documento preferencial.
4. **Preservación de Saldo y Cuenta:** El cambio de categoría tarifaria actualiza únicamente el perfil de tarifa de la tarjeta; la `Cuenta` (`cuentaId`) y su saldo permanecen inalterados.

---

## Fuera de Alcance (Out of Scope)

- Reajuste o reembolso retroactivo de pasajes consumidos con tarifas previas.
- Renovación física del plástico.

---

## Criterios de Aceptación

- [ ] Una tarjeta activa con categoría `GENERAL` cambia a `ESTUDIANTE` tras validar exitosamente el carnet estudiantil vigente.
- [ ] Una tarjeta activa con categoría `GENERAL` cambia a `ADULTO_MAYOR` tras validar documento con edad mayor o igual a 65 años.
- [ ] La solicitud es rechazada si la tarjeta está en estado `BLOCKED_FRAUDE`, manteniendo su categoría original.
- [ ] La solicitud es rechazada si la tarjeta está en estado `BLOCKED_PERDIDA`.
- [ ] La solicitud es rechazada si el documento para la categoría solicitada es inválido o insuficiente.
