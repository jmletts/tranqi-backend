# Constitución Técnica: Stack y Convenciones de Arquitectura

## 1. Stack Tecnológico Oficial

El backend de Tranki se implementa con las siguientes tecnologías base:

- **Lenguaje:** Java 21 (LTS). Se deben aprovechar características modernas como Records, Pattern Matching para switch/instanceof, y colecciones inmutables.
- **Framework:** Spring Boot 3.x (Spring Framework 6).
- **Persistencia:** Spring Data JPA con Hibernate, PostgreSQL para producción / H2 para perfiles de pruebas en memoria.
- **Mensajería / Eventos:** Broker ligero MQTT / AMQP para alertas push en tiempo real con la flota. Endpoints de descarga HTTP protegidos mediante **Rate Limiting** (sin autenticación requerida).
- **Testing:**
  - JUnit 5 (Jupiter)
  - AssertJ para aserciones fluidas
  - Mockito para dobles de prueba
  - Cucumber-JVM 7.x para ejecución de especificaciones BDD en Gherkin

---

## 2. Convenciones de Nomenclatura Java

### Regla de Idioma
**Todo identificador del código fuente Java está en inglés.** Los comentarios de código y la documentación de escenarios Gherkin permanecen en español.

### Tabla de Convenciones por Elemento

| Elemento | Convención | Ejemplo |
|---|---|---|
| Variables y parámetros | `lowerCamelCase` | `accountId`, `debtMarginLimit` |
| Métodos | `lowerCamelCase`, verbo al inicio | `debitBalance()`, `linkUser()` |
| Clases e interfaces | `UpperCamelCase` (PascalCase) | `Account`, `CardRepository` |
| Enumerados (tipo) | `UpperCamelCase` | `CardStatus`, `FareCategory` |
| Valores de enum | `UPPER_SNAKE_CASE` | `FRAUD_BLOCKED`, `IN_INVENTORY` |
| Constantes (`static final`) | `UPPER_SNAKE_CASE` | `DEBT_MARGIN_LIMIT`, `MAX_LINK_ATTEMPTS` |
| Paquetes | Dominio invertido, minúsculas, sin guiones | `com.tranki.backend.account` |
| DTOs | `{Entidad}RequestDTO` / `{Entidad}ResponseDTO` como Java Records | `IssueCardRequestDTO`, `AccountBalanceResponseDTO` |
| Entidades JPA | `{Entidad}JpaEntity` — nunca la misma clase que el modelo de dominio | `AccountJpaEntity`, `CardJpaEntity` |
| Puertos de entrada (casos de uso) | `{Verbo}{Sustantivo}UseCase` | `IssueCardUseCase`, `TransferFundsUseCase` |
| Puertos de salida (repositorios) | `{Entidad}Repository` (interfaz de dominio) | `AccountRepository`, `CardRepository` |
| Adaptadores de persistencia | `{Entidad}PersistenceAdapter` | `AccountPersistenceAdapter` |
| Controladores REST | `{Recurso}Controller` | `CardController`, `AccountController` |

---

## 3. Arquitectura Hexagonal (Ports & Adapters) — Package by Feature

Cada módulo de negocio es su propia carpeta raíz (package by feature), y dentro de cada módulo se respeta la estructura hexagonal.

```text
src/main/java/com/tranki/backend/
│
├── account/
│   ├── domain/
│   │   ├── Account.java                    ← modelo de dominio puro (sin Spring/JPA)
│   │   ├── AccountStatus.java              ← enum
│   │   ├── FareCategory.java               ← enum (GENERAL, SCHOOL, UNIVERSITY)
│   │   ├── Money.java                      ← Value Object
│   │   ├── AccountRepository.java          ← interfaz (puerto de salida)
│   │   └── InsufficientFundsException.java ← excepción de dominio
│   ├── application/
│   │   ├── RechargeAccountUseCase.java
│   │   ├── TransferFundsUseCase.java
│   │   └── GetAccountMovementsUseCase.java
│   └── adapter/
│       ├── in/web/
│       │   ├── AccountController.java
│       │   └── dto/
│       │       ├── RechargeRequestDTO.java
│       │       └── AccountBalanceResponseDTO.java
│       └── out/persistence/
│           ├── AccountJpaEntity.java         ← DISTINTA de Account.java (con @Entity)
│           ├── AccountJpaRepository.java     ← Spring Data JpaRepository
│           └── AccountPersistenceAdapter.java ← implementa AccountRepository
│
├── card/
│   ├── domain/
│   │   ├── Card.java
│   │   ├── CardStatus.java                  ← enum (IN_INVENTORY, ACTIVE, BLOCKED_DEBT, FRAUD_BLOCKED, LOST_REPORTED)
│   │   ├── CardRepository.java
│   │   └── CardAlreadyLinkedException.java
│   ├── application/
│   │   ├── IssueCardUseCase.java
│   │   ├── ChangeFareCategoryUseCase.java
│   │   ├── LinkCardToUserUseCase.java
│   │   └── ReportLostCardUseCase.java
│   └── adapter/
│       ├── in/web/
│       │   ├── CardController.java
│       │   └── dto/
│       │       ├── IssueCardRequestDTO.java
│       │       └── CardStatusResponseDTO.java
│       └── out/persistence/
│           ├── CardJpaEntity.java
│           ├── CardJpaRepository.java
│           └── CardPersistenceAdapter.java
│
├── trip/
│   ├── domain/
│   │   ├── Trip.java
│   │   ├── TripProcessingStatus.java        ← enum (PENDING, PROCESSED, DISCARDED_DUPLICATE)
│   │   └── TripRepository.java
│   ├── application/
│   │   └── ProcessTripBatchUseCase.java
│   └── adapter/
│       ├── in/mqtt/
│       │   └── TripBatchMqttConsumer.java
│       └── out/persistence/
│           ├── TripJpaEntity.java
│           └── TripPersistenceAdapter.java
│
├── blacklist/
│   ├── domain/
│   │   ├── BlacklistEntry.java
│   │   ├── BlockReason.java                 ← enum (DEBT, LOST_STOLEN, FRAUD)
│   │   └── BlacklistRepository.java
│   ├── application/
│   │   └── PublishBlacklistUpdateUseCase.java
│   └── adapter/
│       ├── in/scheduler/
│       │   └── BlacklistDeltaScheduler.java ← job cada 5 min
│       └── out/
│           ├── persistence/
│           │   └── BlacklistPersistenceAdapter.java
│           └── messaging/
│               └── BlacklistEventPublisher.java
│
└── shared/
    ├── domain/
    │   └── Money.java                       ← Value Object compartido
    └── infrastructure/
        └── exception/
            └── GlobalExceptionHandler.java  ← @RestControllerAdvice único
```

---

## 4. Principio de Inmutabilidad y Aislamiento de Entidades

1. **Entidades de Dominio Encapsuladas:**
   - Las entidades del dominio no son JavaBeans anémicos; deben contener la lógica invariante de negocio y métodos con nombres del lenguaje ubicuo.
   - El estado de los agregados solo se modifica a través de métodos de negocio explícitos.

2. **Prohibición de Entidades en REST (DTO Obligatorio):**
   - **Ninguna** entidad del dominio ni entidad JPA puede ser devuelta directamente en una respuesta HTTP ni aceptada en un `@RequestBody`.
   - Se debe utilizar la capa de `DTO` (preferiblemente Java `record`) junto con mappers dedicados para transformar datos entre capas.

3. **Regla de oro entre módulos:**
   - Ningún módulo importa el `JpaRepository` o el `JpaEntity` de otro módulo directamente.
   - La comunicación entre módulos ocurre únicamente a través de las interfaces públicas (casos de uso o puertos de dominio).

---

## 5. Rutas REST y Convenciones de API

| Convención | Regla | Ejemplo |
|---|---|---|
| Versionado | Prefijo `/api/v1/` | `/api/v1/cards` |
| Sustantivos en plural | Nunca verbos en la URL | `/cards`, no `/getCard` |
| Manejo de errores | Un único `@RestControllerAdvice` en `shared/infrastructure/exception/` | `GlobalExceptionHandler` |

---

## 6. Convenciones de Especificación y Testing BDD

### Convenciones para Archivos Gherkin (.feature)
- **Palabras clave:** Estrictamente en inglés (`Feature:`, `Background:`, `Scenario:`, `Scenario Outline:`, `Given`, `When`, `Then`, `And`, `But`, `Examples:`).
- **Cuerpo textual:** Estrictamente en **español latinoamericano / neutro**.
- **Identificadores de campo entre comillas:** Los nombres de campos Java (ej. `"userId"`, `"fareCategory"`) se mencionan entre comillas dobles en las oraciones Gherkin para dejar claro que se refieren al campo del código.
- **Enfoque declarativo:** Describir la intención del usuario y la respuesta del sistema, no detalles de implementación HTTP o base de datos.

### Nomenclatura Obligatoria de Identificadores (IDs) en Pruebas

| Prefijo | Entidad de Negocio | Ejemplo |
|---|---|---|
| `CTA-XXX` | Cuenta (`Account`) | `CTA-001`, `CTA-102` |
| `TRK-XXXX` | Tarjeta inteligente NFC (`Card`) | `TRK-1001`, `TRK-8820` |
| `TRX-XXX` | Transacción / Recarga (`Recharge`) | `TRX-501`, `TRX-990` |
| `USR-XXX` | Usuario (`User`) | `USR-001`, `USR-042` |
| `BUS-XXX` | Unidad de bus / Validador ESP32 | `BUS-101`, `BUS-204` |
| `VIA-XXX` | Viaje / Validación de abordaje (`Trip`) | `VIA-7001`, `VIA-7002` |
| `AGT-XXX` | Agente de kiosco (`KioskAgent`) | `AGT-001`, `AGT-010` |
| `PRC-XXX` | Punto de recarga (`RechargePoint`) | `PRC-001`, `PRC-005` |

---

## 7. Estándares de Documentación de Historias de Usuario (.md)

Cada archivo de historia de usuario dentro de `.specs/features/` debe contener:
1. **Título y Código:** `US-XX: Nombre de la Historia`
2. **Estructura Mike Cohn:**
   - **Como** [Rol del actor]
   - **Quiero** [Acción o capacidad requerida]
   - **Para** [Beneficio de negocio obtenido]
3. **Reglas de Negocio Específicas:** Listado numerado con las validaciones e invariantes que aplican al flujo.
4. **Fuera de Alcance (Out of Scope):** Qué casos o variantes no resuelve esta historia para evitar ambigüedades.
5. **Criterios de Aceptación:** Condiciones verificables de completitud.
