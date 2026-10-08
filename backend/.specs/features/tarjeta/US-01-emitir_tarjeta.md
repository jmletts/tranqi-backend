# US-01: Emisión Inicial de Tarjeta

## Descripción
**Como** operador de taquilla o kiosco de transporte,  
**Quiero** emitir una tarjeta física registrando la categoría tarifaria y validando el documento sustentatorio,  
**Para** entregar una tarjeta activa y operativa a un pasajero sin requerir registro personal previo.

---

## Reglas de Negocio

1. **Estado Inicial y Transición:** La tarjeta física debe existir previamente en el sistema en estado `EN_INVENTARIO`. Al emitirse exitosamente, pasa a estado `ACTIVE`.
2. **Creación de Cuenta 1:1:** Cada emisión crea una nueva y única `Cuenta` vinculada exclusivamente a dicha tarjeta (`1:1`). El saldo inicial por defecto es `0.00` salvo que se acompañe de una recarga inicial.
3. **Anonimato por Defecto:** La tarjeta se emite con `usuarioId = null`. No se vincula a ninguna cuenta de usuario digital durante la emisión.
4. **Validación de Documento por Categoría Tarifaria:**
   - **`GENERAL`:** No requiere validación de documento preferencial.
   - **`ESTUDIANTE`:** Requiere validar un documento estudiantil vigente (código de matrícula o carnet universitario).
   - **`ADULTO_MAYOR`:** Requiere validar documento de identidad con edad mayor o igual a 65 años.
5. **Unicidad del Serial:** No se puede emitir una tarjeta cuyo identificador serial ya se encuentre en estado `ACTIVE`, `BLOCKED_DEUDA`, `BLOCKED_FRAUDE` o `BLOCKED_PERDIDA`.

---

## Fuera de Alcance (Out of Scope)

- Registro o creación de perfil de usuario en la aplicación móvil o web.
- Vinculación de nombre y correo electrónico del pasajero durante la emisión.
- Procesamiento de cobro por costo plástico de la tarjeta.

---

## Criterios de Aceptación

- [ ] Si se emite una tarjeta `EN_INVENTARIO` con categoría `GENERAL`, se crea la `Cuenta` con balance `0.00` y la tarjeta queda en estado `ACTIVE` con `usuarioId` nulo.
- [ ] Si se emite con categoría `ESTUDIANTE` y el documento estudiantil es válido, la tarjeta se activa con tarifa preferencial de estudiante.
- [ ] Si se emite con categoría `ESTUDIANTE` con documento inválido o vencido, la emisión es rechazada y la tarjeta permanece `EN_INVENTARIO`.
- [ ] Si se emite con categoría `ADULTO_MAYOR` y el titular no cumple con la edad mínima requerida, la emisión es rechazada.
- [ ] Si se intenta emitir una tarjeta que ya está en estado `ACTIVE`, se devuelve un error de tarjeta ya emitida.
