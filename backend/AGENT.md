# Tranki Backend - Instrucciones para Agentes de IA

Bienvenido al repositorio del backend de **Tranki**, el sistema de pago y control de transporte público urbano mediante tarjetas inteligentes NFC y validadores embebidos físicos (ESP32).

---

## 1. Misión del Agente

Tu rol es actuar como un **Arquitecto de Software Senior y Desarrollador Especialista en Spec-Driven Development (SDD), Domain-Driven Design (DDD) y Behavior-Driven Development (BDD)**.

Toda implementación técnica debe derivarse estrictamente de las especificaciones funcionales y reglas de negocio documentadas en la carpeta `.specs/`.

---

## 2. Mapa de Especificaciones (.specs/)

```text
tranki-backend/
├── .specs/
│   ├── constitution/
│   │   ├── tech-stack.md             # Convenciones de código, arquitectura y testing
│   │   └── domain-rules.md           # Reglas inmutables del dominio (Agregados y Entidades)
│   └── features/
│       ├── tarjeta/                  # Emisión, configuración, pérdida, fraude
│       │   ├── US-01-emitir_tarjeta.md
│       │   ├── emitir_tarjeta.feature
│       │   ├── US-02-cambiar_categoria_tarifaria.md
│       │   ├── cambiar_categoria_tarifaria.feature
│       │   ├── US-03-configurar_tarjeta.md
│       │   ├── configurar_tarjeta.feature
│       │   ├── US-04-reportar_tarjeta_perdida.md
│       │   ├── reportar_tarjeta_perdida.feature
│       │   ├── US-05-bloquear_tarjeta_fraude.md
│       │   └── bloquear_tarjeta_fraude.feature
│       ├── cuenta/                   # Recargas, transferencias, consultas
│       │   ├── US-06-confirmar_recarga.md
│       │   ├── confirmar_recarga.feature
│       │   ├── US-07-transferir_dinero.md
│       │   ├── transferir_dinero.feature
│       │   ├── US-08-consultar_movimientos.md
│       │   └── consultar_movimientos.feature
│       ├── validador/                # Abordaje offline y lógica local ESP32
│       │   ├── US-09-validacion_abordaje.md
│       │   └── validacion_abordaje.feature
│       ├── viaje/                    # Sincronización idempotente por lotes
│       │   ├── US-10-procesar_lote_viajes.md
│       │   └── procesar_lote_viajes.feature
│       └── listanegra/               # Distribución de bloqueos y deltas
│           ├── US-11-publicar_actualizacion_listanegra.md
│           └── publicar_actualizacion_listanegra.feature
└── AGENT.md
```

---

## 3. Regla de Idioma (CRÍTICA)

| Artefacto | Idioma |
|---|---|
| Identificadores Java (campos, métodos, clases, constantes, paquetes) | **Inglés** |
| Valores de enumerados Java | **Inglés** (`UPPER_SNAKE_CASE`) |
| Comentarios de código | Español |
| Redacción de escenarios Gherkin (oraciones) | Español |
| Palabras clave Gherkin (`Feature`, `Given`, `When`, `Then`...) | Inglés |
| Nombres de campos citados dentro de oraciones Gherkin | **Inglés** (entre comillas: `"userId"`, `"fareCategory"`) |

---

## 4. Tabla de Traducción de Identificadores Clave

| Lenguaje de negocio (español) | Identificador Java | Entidad |
|---|---|---|
| Identificador de cuenta | `accountId` | `Account` |
| Identificador de tarjeta | `cardId` | `Card` |
| Identificador de usuario | `userId` | `Account` (nullable) |
| Categoría tarifaria | `fareCategory` | `Account` |
| Número de verificación | `verificationNumber` | `Card` |
| Hash del código de seguridad | `securityCodeHash` | `Card` |
| Agente de kiosco emisor | `kioskAgentId` | `Card` |
| Límite de margen de deuda | `debtMarginLimit` | `Account` |
| Saldo | `balance` | `Account` |
| Tarifa | `fare` | `Trip` |
| Marca de tiempo local | `localTimestamp` | `Trip` |
| Estado de procesamiento | `processingStatus` | `Trip` |
| Clave de idempotencia de recarga | `externalTransactionId` | `Recharge` |

---

## 5. Reglas Inmutables de Negocio (Resumen Autoritativo)

1. **Identidad:** La entidad `User` **no** tiene roles. Un usuario puede administrar múltiples tarjetas.
2. **Relación 1:1 Account-Card:** Toda `Account` pertenece de forma exclusiva a una única `Card` activa.
3. **Cuentas Anónimas:** El campo `userId` reside en la **`Account`** (no en la `Card`) y puede ser `null`, indicando una cuenta anónima adquirida en kiosco. Esto es un modo de operación válido y esperado.
4. **`fareCategory` en `Account`:** La categoría tarifaria también vive en `Account`, no en `Card`. Esto permite que un reemplazo por pérdida no requiera copiar ningún dato — la `Account` persiste sin cambios.
5. **Ciclo de Vida de `Card` (`CardStatus`):**
   - `IN_INVENTORY`: Fabricada, no vendida.
   - `ACTIVE`: Vendida y activada (con o sin `userId` en su `Account`).
   - `BLOCKED_DEBT`: Bloqueo automático recuperable al saldar saldo negativo.
   - `FRAUD_BLOCKED`: Bloqueo administrativo definitivo, inmune a recargas.
   - `LOST_REPORTED`: Bloqueo terminal e irreversible por extravío/robo.
6. **`FareCategory` (`fareCategory`):**
   - `GENERAL`: Sin documento, saldo inicial S/ 5.00, tarifa S/ 1.20.
   - `SCHOOL`: DNI vigente, saldo inicial S/ 2.50, tarifa S/ 0.60.
   - `UNIVERSITY`: Carnet universitario vigente, saldo inicial S/ 5.00, tarifa S/ 0.60.
7. **Reemplazo por Pérdida:** La `Card` nueva apunta al mismo `accountId`. No se copia `userId` ni `fareCategory` porque nunca estuvieron en la `Card`.
8. **Origen de Recargas:** No existen recargas originadas desde apps móviles. Solo `KIOSK` y `DIGITAL_GATEWAY`.
9. **Desacoplamiento del Validador:** Los validadores físicos (ESP32) validan abordajes de forma 100% autónoma contra su lista negra local. **Nunca** realizan consultas HTTP/gRPC síncronas al backend en el momento del abordaje.

---

## 6. Convenciones de Desarrollo y Testing

- **Gherkin:** Palabras clave en inglés, redacción en **español**, campos Java citados en inglés entre comillas.
- **Prefijos de Identificadores en Pruebas:**
  - Cuentas: `CTA-XXX`
  - Tarjetas: `TRK-XXXX`
  - Transacciones / Recargas: `TRX-XXX`
  - Usuarios: `USR-XXX`
  - Buses / Validadores: `BUS-XXX`
  - Viajes: `VIA-XXX`
  - Agentes de kiosco: `AGT-XXX`
  - Puntos de recarga: `PRC-XXX`
- **Arquitectura (Java 21 / Spring Boot 3):**
  - Hexagonal estricta + Package by Feature: cada módulo de negocio (`account/`, `card/`, `trip/`, `blacklist/`) contiene sus propias capas `domain/`, `application/`, `adapter/`.
  - Las entidades del dominio (`Account`, `Card`) **nunca** se exponen en controladores REST — obligatoriedad de DTOs (Java Records) y mappers.
  - `AccountJpaEntity` y `Account` son clases **distintas** — el adaptador de persistencia traduce entre ellas.
  - Un único `@RestControllerAdvice` en `shared/infrastructure/exception/GlobalExceptionHandler`.
