# US-03: Configuración y Vinculación de Tarjeta a Usuario

## Descripción
**Como** usuario registrado del sistema,  
**Quiero** vincular una tarjeta física anónima activa a mi perfil de usuario,  
**Para** administrar su saldo, transferir fondos y consultar su historial desde mis canales digitales.

---

## Reglas de Negocio

1. **Estado de Tarjeta:** La tarjeta a vincular debe encontrarse en estado `ACTIVE`. No se pueden vincular tarjetas en estado `EN_INVENTARIO`, `BLOCKED_FRAUDE` o `BLOCKED_PERDIDA`.
2. **Condición de Tarjeta Anónima:** La tarjeta debe ser anónima (`usuarioId == null`). No se permite sobreescribir la vinculación de una tarjeta que ya tenga un `usuarioId` asignado.
3. **No Creación de Cuenta:** La operación **no** crea una cuenta nueva. Se conserva estrictamente la `Cuenta` (`cuentaId`) y el saldo existente asociado a la tarjeta (`1:1`).
4. **Multitarjeta por Usuario:** Un usuario identificado con `usuarioId` (`USR-XXX`) puede tener múltiples tarjetas asociadas a su perfil simultáneamente.
5. **Existencia del Usuario:** El identificador de usuario `usuarioId` debe existir previamente en el repositorio de usuarios.
6. **Proceso de Activación:** La operacion de vicullacion se remite al uso de dos codigo de sgiridad que vendra en un tarjeta fisica, contara de dos 

---

## Fuera de Alcance (Out of Scope)

- Registro inicial de credenciales de usuario (login, password, OAuth).
- Desvinculación voluntaria de la tarjeta (proceso separado de baja o cesión).

---

## Criterios de Aceptación

- [ ] Si un usuario `USR-001` vincula una tarjeta activa anónima `TRK-3001`, el campo `usuarioId` de la tarjeta pasa a ser `USR-001` y se mantiene la misma cuenta y saldo.
- [ ] Si el usuario ya posee otra tarjeta (`TRK-3002`), la nueva vinculación es exitosa y el usuario pasa a administrar ambas tarjetas.
- [ ] Si se intenta vincular una tarjeta que ya pertenece a otro usuario (`usuarioId != null`), la operación es rechazada con error de tarjeta ya vinculada.
- [ ] Si se intenta vincular una tarjeta en estado `EN_INVENTARIO`, la operación es rechazada.
- [ ] Si se intenta vincular una tarjeta en estado `BLOCKED_FRAUDE` o `BLOCKED_PERDIDA`, la operación es rechazada.
