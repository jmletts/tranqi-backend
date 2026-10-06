# Constitución del Dominio: Reglas Inmutables y Agregados

Este documento define la **verdad autoritativa e inmutable** del modelo de negocio del sistema **Tranki**.
Toda especificación de historia de usuario, escenario Gherkin y código productivo debe adherirse estrictamente a estas reglas.

> **Nota de idioma:** Todos los identificadores del código Java (campos, métodos, clases, constantes, paquetes)
> se escriben en **inglés**. La documentación, comentarios y redacción de escenarios Gherkin permanecen en español.

---

## 1. Tabla de Traducción de Campos (Lenguaje Ubicuo → Java)

Esta tabla es la fuente de verdad para evitar inconsistencias entre el lenguaje de negocio (español) y el código.

| Lenguaje de negocio (español) | Identificador Java | Tipo Java | Entidad |
|---|---|---|---|
| Identificador de cuenta | `accountId` | `UUID` | `Account` |
| Identificador de tarjeta (UID NFC) | `cardId` | `String` | `Card` |
| Identificador de usuario | `userId` | `UUID` | `Account` (nullable) |
| Identificador de recarga | `rechargeId` | `UUID` | `Recharge` |
| Identificador de viaje | `tripId` | `UUID` | `Trip` |
| Identificador de punto de recarga | `rechargePointId` | `UUID` | `RechargePoint` |
| Identificador de agente de kiosco | `kioskAgentId` | `UUID` | `Card` |
| Número de verificación (12 dígitos) | `verificationNumber` | `String` | `Card` |
| Hash del código de seguridad | `securityCodeHash` | `String` | `Card` |
| Categoría tarifaria | `fareCategory` | `FareCategory` (enum) | `Account` |
| Límite de margen de deuda | `debtMarginLimit` | `Money` | `Account` |
| Saldo | `balance` | `Money` | `Account` |
| Estado de la tarjeta | `cardStatus` | `CardStatus` (enum) | `Card` |
| Estado de la cuenta | `accountStatus` | `AccountStatus` (enum) | `Account` |
| Estado de procesamiento del viaje | `processingStatus` | `TripProcessingStatus` (enum) | `Trip` |
| Marca de tiempo local del validador | `localTimestamp` | `LocalDateTime` | `Trip` |
| Tarifa del viaje | `fare` | `Money` | `Trip` |
| ¿Fue viaje en deuda? | `wasDebtTrip` | `boolean` | `Trip` |
| Clave de idempotencia de recarga | `externalTransactionId` | `String` | `Recharge` |
| Motivo de bloqueo en lista negra | `blockReason` | `BlockReason` (enum) | `BlacklistEntry` |
| Viajes en deuda restantes | `remainingDebtTrips` | `int` | `BlacklistEntry` |

---

## 2. Enumerados del Dominio (Enum Values en UPPER_SNAKE_CASE)

### `CardStatus` — Estados de la Tarjeta

| Valor | Significado | ¿Permite Abordaje? | ¿Permite Recarga? |
|---|---|:---:|:---:|
| `IN_INVENTORY` | Fabricada, en almacén, no vendida | No | No |
| `ACTIVE` | Vendida y activada (con o sin `userId`) | Sí | Sí |
| `BLOCKED_DEBT` | Saldo inferior al `debtMarginLimit`. Se levanta al recargar. | No | Sí |
| `FRAUD_BLOCKED` | Bloqueo administrativo por fraude. **No** se levanta con recargas. | No | No |
| `LOST_REPORTED` | Bloqueo terminal e irreversible por extravío/robo. | No | No |

> **CORRECCIÓN respecto a versión anterior:** Los estados `BLOCKED_FRAUDE` y `BLOCKED_PERDIDA` del lenguaje ubicuo
> español se traducen a `FRAUD_BLOCKED` y `LOST_REPORTED` en Java. El estado `BLOCKED_DEUDA` del lenguaje ubicuo
> se traduce a `BLOCKED_DEBT`. `EN_INVENTARIO` se traduce a `IN_INVENTORY`.

### `FareCategory` — Categoría Tarifaria

| Valor | Documento requerido | Saldo inicial | Tarifa de abordaje |
|---|---|---|---|
| `GENERAL` | Ninguno | S/ 5.00 | S/ 1.20 |
| `SCHOOL` | DNI vigente | S/ 2.50 | S/ 0.60 |
| `UNIVERSITY` | Carnet universitario vigente | S/ 5.00 | S/ 0.60 |

> **CORRECCIÓN:** Los valores del lenguaje ubicuo `ESCOLAR` y `UNIVERSITARIO` se traducen a `SCHOOL` y `UNIVERSITY`
> en Java. La categoría `ADULTO_MAYOR` **no existe** en el modelo actual.

### `BlockReason` — Motivo de entrada en Lista Negra

| Valor | Política de purga |
|---|---|
| `DEBT` | Nunca se purga por tiempo; se retira solo al pagar la deuda. |
| `LOST_STOLEN` | Se purga automáticamente a los 90 días del reporte. |
| `FRAUD` | Nunca se purga automáticamente; requiere revisión administrativa explícita. |

### `RechargePointType` — Tipo de punto de recarga

| Valor | Descripción |
|---|---|
| `KIOSK` | Terminal físico de autoservicio o taquilla presencial. |
| `DIGITAL_GATEWAY` | Pasarela autorizada de cobro / webhook bancario. |

### `TripProcessingStatus` — Estado de procesamiento del viaje

| Valor | Descripción |
|---|---|
| `PENDING` | Recibido en el lote, pendiente de procesamiento. |
| `PROCESSED` | Procesado y debitado correctamente. |
| `DISCARDED_DUPLICATE` | Descartado por `tripId` ya registrado (idempotencia). |

---

## 3. Agregados Raíz y Entidades

### `Account` (Agregado Raíz — Contexto: Cuentas)
Campos Java:
```java
UUID accountId
Money balance
Money debtMarginLimit   // valor fijo del sistema, ej. -3.00
AccountStatus status    // ACTIVE | BLOCKED_DEBT
UUID userId             // nullable — null = cuenta anónima
FareCategory fareCategory
```

> **Regla crítica:** `userId` y `fareCategory` viven en `Account`, **no** en `Card`. Esto garantiza que un
> reemplazo de tarjeta por pérdida no requiera copiar ningún dato — la `Account` persiste intacta.

### `Card` (Agregado Raíz — Contexto: Tarjetas)
Campos Java:
```java
String cardId              // UID del chip NFC
UUID accountId             // referencia a su Account
CardStatus cardStatus
String verificationNumber  // 12 dígitos, único globalmente, generado con SecureRandom
String securityCodeHash    // hash de 4 dígitos tipo CVV, nunca en texto plano
UUID kioskAgentId          // agente que realizó la emisión, para auditoría
```

### `Trip` (Agregado Raíz — Contexto: Viajes)
Campos Java:
```java
UUID tripId
UUID accountId
String cardId
String validatorId
Money fare
LocalDateTime localTimestamp
boolean wasDebtTrip
TripProcessingStatus processingStatus
```

### `Recharge` (Agregado Raíz — Contexto: Recargas)
Campos Java:
```java
UUID rechargeId
String externalTransactionId  // clave de idempotencia
UUID accountId
Money amount
UUID rechargePointId
RechargeStatus status         // PENDING | CONFIRMED | FAILED
```

### `BlacklistEntry` (Contexto: Lista Negra)
Campos Java:
```java
String cardId
BlockReason blockReason
int remainingDebtTrips
```

---

## 4. Invariantes de Dominio por Agregado

### `Account`
1. El `balance` no puede quedar por debajo de `debtMarginLimit` tras una transferencia.
2. Una `Account` con `userId = null` es anónima; esto es un modo de operación válido, no un estado de error.
3. El `fareCategory` solo puede cambiar mediante el comando `ChangeFareCategory`, ejecutado por un `KioskAgent` con validación de documento.

### `Card`
1. El `verificationNumber` debe ser único globalmente. Se genera con `SecureRandom`; ante colisión, se regenera hasta 5 veces.
2. El `securityCodeHash` nunca se almacena ni compara en texto plano.
3. La vinculación (`userId` de la `Account`) se bloquea definitivamente tras 5 intentos fallidos consecutivos con `securityCode` incorrecto.
4. Una `Card` en estado `LOST_REPORTED` o `FRAUD_BLOCKED` no puede cambiar de `FareCategory`.
5. Solo una `Card` en estado `ACTIVE` puede ser reportada como perdida.

### `Recharge`
1. No existen recargas originadas desde la aplicación móvil del usuario en esta fase.
2. Canales autorizados: `KIOSK` (presencial) y `DIGITAL_GATEWAY` (webhook bancario).
3. El campo `externalTransactionId` garantiza idempotencia — una recarga con el mismo ID no se procesa dos veces.

### `Trip`
1. El `tripId` es la clave de idempotencia en lote — duplicados se descartan con estado `DISCARDED_DUPLICATE`.
2. El `localTimestamp` no puede ser una fecha futura respecto al momento de procesamiento en el backend.
3. Si procesar un viaje lleva el `balance` por debajo del `debtMarginLimit`, el viaje se registra igual (no se revierte) pero queda marcado para revisión de exceso de deuda.

---

## 5. Reglas de Reemplazo por Pérdida (Simplificadas por el Diseño)

Al reportar una `Card` como perdida:
1. La `Card` original pasa a `LOST_REPORTED` y se publica en la lista negra con motivo `LOST_STOLEN`.
2. La `Card` de reemplazo recibe un nuevo `cardId`, `verificationNumber` y `securityCodeHash`.
3. La `Card` de reemplazo apunta al **mismo `accountId`** que la original.
4. No se copia `userId` ni `fareCategory` porque **nunca estuvieron en la `Card`** — siempre residieron en la `Account`, que no cambia.

---

## 6. Origen Restringido de Recargas

- **Fuera de alcance (fase actual):** recargas iniciadas desde la aplicación móvil del usuario.
- **Canales autorizados:**
  - `KIOSK`: Terminal físico presencial, operado por un `KioskAgent`.
  - `DIGITAL_GATEWAY`: Webhook/pasarela de pago externa que notifica el backend.

---

## 7. Desacoplamiento Operativo del Validador Físico (ESP32)

1. **Autonomía total offline:** la decisión de autorizar o rechazar el abordaje se toma localmente contra la lista negra en memoria del validador (Bloom Filter / hash table).
2. **Sin consultas síncronas al backend:** el validador nunca hace peticiones HTTP/gRPC en el momento del abordaje.
3. **Margen de crédito de emergencia:** el validador puede autorizar abordaje si el saldo cubre la tarifa o si queda dentro del `debtMarginLimit` (`DEBT_MARGIN_LIMIT` como constante en el firmware).
4. **Sincronización asíncrona:** los registros de viaje se despachan en lotes al backend cuando el vehículo recupera cobertura de red.
