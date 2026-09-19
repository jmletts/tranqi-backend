# Constitución del Dominio: Reglas Inmutables y Agregados

Este documento define la verdad autoritativa e inmutable del modelo de negocio del sistema **Tranki**. Toda especificación de historia de usuario, escenario Gherkin y código productivo debe adherirse estrictamente a estas reglas.

---

## 1. Modelo de Identidad y Usuarios

1. **Ausencia de Jerarquías o Roles:** La entidad `Usuario` **no** posee roles de tipo jerárquico como `TITULAR`, `TUTOR` o `SUBORDINADO`.
2. **Capacidad de Gestión Multitarjeta:** Un mismo `Usuario` puede poseer y administrar múltiples tarjetas registradas bajo su perfil personal.
3. **Desvinculación Obligatoria Inicial:** Las tarjetas recién fabricadas o comercializadas nacen sin titular obligatorio.

---

## 2. Relación 1:1 Invariable entre Cuenta y Tarjeta

1. **Exclusividad:** Toda `Cuenta` pertenece de manera exclusiva a exactamente una `Tarjeta` (`1:1`).
2. **Inexistencia de Cuentas Compartidas:** No existen cuentas compartidas entre múltiples tarjetas físicas. Cada tarjeta física tiene su propio balance contable, saldo y registro de movimientos asociado a su identificador de cuenta (`cuentaId`).

---

## 3. Tarjetas Anónimas y Propiedad del Vínculo

1. **Ubicación del Vínculo:** La referencia `usuarioId` reside directamente en la entidad `Tarjeta`, no en la `Cuenta`.
2. **Nulidad Permitida (`usuarioId` = null):** Cuando `usuarioId` es nulo, la tarjeta es **anónima**.
3. **Operación en Kiosco:** Las tarjetas anónimas pueden ser adquiridas, recargadas y utilizadas para abordar mediante kioscos físicos sin necesidad de registro personal ni autenticación de usuario.

---

## 4. Ciclo de Vida y Estados de la Tarjeta

| Estado | Significado de Negocio | ¿Permite Abordaje? | ¿Permite Recarga? |
|---|---|:---:|:---:|
| `EN_INVENTARIO` | Tarjeta física producida y serializada, en almacén. No ha sido vendida ni activada. No tiene cuenta activa. | No | No |
| `ACTIVE` | Tarjeta vendida y activada con cuenta asociada (con o sin `usuarioId`). Saldo en rango operativo. | Sí | Sí |
| `BLOCKED_DEUDA` | Saldo inferior al margen de deuda permitido o saldo negativo en sincronización. Se levanta de forma automática tras recargar saldo positivo. | No (en lista negra) | Sí |
| `BLOCKED_FRAUDE` | Bloqueo administrativo forzoso por sospecha o confirmación de alteración/fraude. **No se levanta con recargas**. | No (en lista negra) | No |
| `BLOCKED_PERDIDA` | Bloqueo terminal irreversible solicitado por el usuario al reportar extravío o robo. Tarjeta dada de baja definitiva. | No (en lista negra) | No |

---

## 5. Regla de Herencia en Reporte de Pérdida

Al reportar una tarjeta como perdida o robada (`reportar_tarjeta_perdida`):
1. La tarjeta física comprometida cambia inmediatamente a estado `BLOCKED_PERDIDA` y es añadida a la Lista Negra para su distribución a validadores.
2. Se emite una nueva tarjeta física de reemplazo.
3. La nueva tarjeta de reemplazo **DEBE heredar**:
   - El mismo `usuarioId` del titular.
   - La misma categoría tarifaria (ej. `ESTUDIANTE`, `ADULTO_MAYOR`, `GENERAL`).
   - La **misma `cuentaId`** de la tarjeta anterior (preservando íntegramente el saldo acumulado o el saldo negativo pendiente).

---

## 6. Origen Restringido de Recargas

1. **Exclusión de Aplicación Móvil:** No existen flujos de recarga directa iniciados desde una aplicación móvil de usuario (billetera digital interactiva).
2. **Canales Autorizados:** Toda recarga financiera de saldo proviene exclusivamente de:
   - Terminales físicos de autoservicio o taquilla (**Kioscos**).
   - Pasarelas autorizadas de cobro / Webhook bancario que confirman un pago externo.

---

## 7. Desacoplamiento Operativo del Validador Físico (ESP32)

1. **Autonomía Total Offline:** La decisión de permitir o rechazar el abordaje de un pasajero se toma en el microcontrolador ESP32 mediante su estructura de datos local (Bloom Filter / hash table local de lista negra).
2. **Cero Dependencia Online en Abordaje:** El validador **jamás** emite peticiones de red síncronas al backend central para consultar saldo o autorización en el momento en que la tarjeta es aproximada al lector NFC.
3. **Margen de Crédito de Emergencia (Deuda Local):** El validador puede autorizar abordaje si el saldo restante en la tarjeta física cubre la tarifa o si se encuentra dentro del margen de deuda negativa permitido (`MARGEN_DEUDA_MAXIMO`).
4. **Sincronización Asíncrona:** Los registros de abordaje se guardan en la memoria persistente del validador y se despachan en lotes (`procesar_lote_viajes`) al backend central cuando el vehículo entra en cobertura de red.
