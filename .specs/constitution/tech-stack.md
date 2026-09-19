# Constitución Técnica: Stack y Convenciones de Arquitectura

## 1. Stack Tecnológico Oficial

El backend de Tranki se implementa con las siguientes tecnologías base:

- **Lenguaje:** Java 21 (LTS). Se deben aprovechar características modernas como Records, Pattern Matching para switch/instanceof, y colecciones inmutables.
- **Framework:** Spring Boot 3.x (Spring Framework 6).
- **Persistencia:** Spring Data JPA con Hibernate, PostgreSQL para producción / H2 para perfiles de pruebas en memoria.
- **Mensajería / Eventos:** Broker ligero MQTT / AMQP para sincronización asíncrona con validadores de flota.
- **Testing:**
  - JUnit 5 (Jupiter)
  - AssertJ para aserciones fluidas
  - Mockito para dobles de prueba
  - Cucumber-JVM 7.x para ejecución de especificaciones BDD en Gherkin

---

## 2. Arquitectura Hexagonal (Ports & Adapters)

El código debe estar estructurado en capas estrictamente desacopladas para garantizar la independencia del framework y la testeabilidad unitaria del dominio:

```text
src/main/java/com/tranki/backend/
├── domain/                         # Núcleo puro de negocio (sin dependencias de Spring)
│   ├── model/                     # Entidades, Value Objects, Enumerados, Agregados
│   ├── exception/                 # Excepciones de dominio de negocio
│   └── repository/                # Interfaces de repositorios (Puertos de salida)
├── application/                    # Casos de uso y orquestación
│   ├── port/
│   │   ├── in/                    # Interfaces de entrada (Casos de Uso)
│   │   └── out/                   # Puertos de salida (Notificaciones, pasarelas)
│   └── service/                   # Implementación de Casos de Uso
└── infrastructure/                 # Adaptadores de tecnología (Spring, JPA, REST, MQTT)
    ├── adapter/
    │   ├── in/
    │   │   ├── web/               # Controladores REST, DTOs de petición/respuesta
    │   │   └── mqtt/              # Consumidores de telemetría y lotes de viajes
    │   └── out/
    │       ├── persistence/       # Entidades JPA, repositorios Spring Data y mappers
    │       └── messaging/         # Productores de listas negras y eventos
    └── config/                    # Configuración de beans de Spring
```

---

## 3. Principio de Inmutabilidad y Aislamiento de Entidades

1. **Entidades de Dominio Encapsuladas:**
   - Las entidades del dominio no son JavaBeans anémicos; deben contener la lógica invariante de negocio y métodos con nombres del lenguaje ubicuo.
   - El estado de los agregados solo se modifica a través de métodos de negocio explícitos.

2. **Prohibición de Entidades en REST (DTO Obligatorio):**
   - **Ninguna** entidad del dominio ni entidad JPA puede ser devuelta directamente en una respuesta HTTP ni aceptada en un `@RequestBody`.
   - Se debe utilizar la capa de `DTO` (preferiblemente Java `record`) junto con mappers dedicados para transformar datos entre capas.

---

## 4. Convenciones de Especificación y Testing BDD

### Convenciones para Archivos Gherkin (.feature)
- **Palabras clave:** Estrictamente en inglés (`Feature:`, `Background:`, `Scenario:`, `Scenario Outline:`, `Given`, `When`, `Then`, `And`, `But`, `Examples:`).
- **Cuerpo textual:** Estrictamente en **español latinoamericano / neutro**.
- **Enfoque declarativo:** Describir la intención del usuario y la respuesta del sistema, no detalles de implementación HTTP o base de datos en las oraciones Gherkin.

### Nomenclatura Obligatoria de Identificadores (IDs) en Pruebas
Para mantener la coherencia semántica en los escenarios de prueba BDD y pruebas unitarias, se deben usar siempre estos prefijos estandarizados:

| Prefijo | Entidad de Negocio | Ejemplo |
|---|---|---|
| `CTA-XXX` | Cuenta de saldo | `CTA-001`, `CTA-102` |
| `TRK-XXXX` | Tarjeta inteligente NFC | `TRK-1001`, `TRK-8820` |
| `TRX-XXX` | Transacción / Recarga / Operación | `TRX-501`, `TRX-990` |
| `USR-XXX` | Usuario titular del sistema | `USR-001`, `USR-042` |
| `BUS-XXX` | Unidad de bus / Validador ESP32 | `BUS-101`, `BUS-204` |
| `VIA-XXX` | Viaje / Validación de abordaje | `VIA-7001`, `VIA-7002` |

---

## 5. Estándares de Documentación de Historias de Usuario (.md)
Cada archivo de historia de usuario dentro de `.specs/features/` debe contener:
1. **Título y Código:** `US-XX: Nombre de la Historia`
2. **Estructura Mike Cohn:**
   - **Como** [Rol del actor]
   - **Quiero** [Acción o capacidad requerida]
   - **Para** [Beneficio de negocio obtenido]
3. **Reglas de Negocio Específicas:** Listado numerado con las validaciones e invariantes que aplican al flujo.
4. **Fuera de Alcance (Out of Scope):** Qué casos o variantes no resuelve esta historia para evitar ambigüedades.
5. **Criterios de Aceptación:** Condiciones verificables de completitud.
