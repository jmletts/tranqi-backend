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

## 3. Reglas Inmutables de Negocio (Resumen Autoritativo)

1. **Identidad:** La entidad `Usuario` **no** tiene roles (como `TITULAR` o `TUTOR`). Un usuario puede administrar múltiples tarjetas.
2. **Relación 1:1 Cuenta-Tarjeta:** Toda `Cuenta` pertenece de forma exclusiva a una única `Tarjeta`.
3. **Tarjetas Anónimas:** El campo `usuarioId` reside en la `Tarjeta` y puede ser nulo (`null`), indicando que es una tarjeta anónima adquirida en kiosco.
4. **Ciclo de Vida de Tarjeta:**
   - `EN_INVENTARIO`: Fabricada y registrada, pero no comercializada ni habilitada para abordaje.
   - `ACTIVE`: Vendida con cuenta asignada (con o sin `usuarioId`).
   - `BLOCKED_DEUDA`: Bloqueo automático recuperable al saldar saldo negativo.
   - `BLOCKED_FRAUDE`: Bloqueo administrativo definitivo, inmune a recargas.
   - `BLOCKED_PERDIDA`: Bloqueo terminal e irreversible por extravío/robo.
5. **Herencia en Pérdida:** Al reportar pérdida, la tarjeta anterior se bloquea terminalmente y la nueva tarjeta emitida **hereda**:
   - Mismo `usuarioId`.
   - Misma categoría tarifaria.
   - Misma `cuentaId` (preservando saldo y deuda acumulada).
6. **Origen de Recargas:** No existen recargas originadas desde apps móviles de usuarios. Solo kioscos físicos y pasarelas de pago autorizadas.
7. **Desacoplamiento del Validador:** Los validadores físicos (ESP32) validan abordajes de forma 100% autónoma contra su lista negra local (Bloom Filter / lista en memoria). **Nunca** realizan consultas HTTP/gRPC síncronas al backend en el momento del abordaje.

---

## 4. Convenciones de Desarrollo y Testing

- **Gherkin:** Palabras clave en inglés (`Feature`, `Scenario`, `Given`, `When`, `Then`, `And`), redacción obligatoria en **español**.
- **Prefijos de Identificadores en Pruebas:**
  - Cuentas: `CTA-XXX`
  - Tarjetas: `TRK-XXXX`
  - Transacciones / Recargas: `TRX-XXX`
  - Usuarios: `USR-XXX`
  - Buses / Validadores: `BUS-XXX`
- **Arquitectura de Código (Java 21 / Spring Boot 3):**
  - Arquitectura Hexagonal estricta: `domain`, `application` (ports & use cases), `infrastructure` (adapters: web, persistence, mqtt/amqp).
  - Las entidades del dominio jamás deben exponerse en controladores REST (obligatoriedad de DTOs y mappers).
