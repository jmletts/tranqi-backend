# Tranki - Backend Central de Recaudo

Tranki es el motor central (backend) de un sistema de recaudo para transporte público. Está diseñado para gestionar transacciones de tarjetas NFC, administrar saldos de cuentas de usuarios y reconciliar viajes de manera robusta, soportando la sincronización masiva de viajes (batch processing) generados por validadores físicos (ESP32) que operan con conectividad intermitente (offline-first).

## Arquitectura y Metodología

El proyecto ha sido concebido bajo prácticas rigurosas de desarrollo de software:
- Domain-Driven Design (DDD) y Arquitectura Hexagonal: Lógica de negocio 100% aislada de frameworks externos y bases de datos (Ports & Adapters).
- CQRS (Command Query Responsibility Segregation): Separación de los modelos de escritura (validación y cálculo de saldos) y de lectura (historial de movimientos proyectado).
- Behavior-Driven Development (BDD): Tests vivos escritos en sintaxis Gherkin (Cucumber) que fungen tanto como pruebas de integración robustas, como documentación funcional del sistema validada por negocio.

## Modulos Principales

1. Card (/card): Emisión, asignación de usuarios, cambios de categorías tarifarias (Estudiante, General) y bloqueos (por pérdida, fraude o exceso de deuda).
2. Account (/account): Gestión central del balance financiero, recargas idempotentes, transferencias seguras entre tarjetas de un mismo titular e historiales de movimiento inmutables.
3. Trip (/trip): Procesamiento de lotes de pasajes cobrados offline en los buses, asegurando idempotencia contra re-envíos por fallas de red y bloqueos automáticos en caso de deudas sobregiradas.

## Como correr el proyecto

Existen dos formas principales de levantar el proyecto: utilizando Docker (recomendado) o corriendo el servidor localmente.

### Metodo 1: Usando Docker Compose (Recomendado)

Esta es la forma mas rapida, ya que levantara tanto la base de datos PostgreSQL como el Backend simultaneamente sin requerir configuracion adicional.

Pre-requisitos: Docker y Docker Compose instalados. El puerto 8080 (backend) y 5432 (Postgres) deben estar libres.

1. Abre tu terminal en la raiz del proyecto.
2. Ejecuta el siguiente comando (en sistemas Linux puede requerir 'sudo'):
```bash
docker compose up -d
```
3. El backend estara disponible en http://localhost:8080 y la base de datos en localhost:5432 (Database: tranki_dev, User: postgres, Pass: tranqi@2026).

### Metodo 2: Modo Desarrollo Local (Backend local)

Si deseas correr el codigo desde tu IDE o terminal local para ver los logs y hacer debug, puedes levantar unicamente la base de datos en Docker y el backend con Maven.

Pre-requisitos: Java 21 instalado.

1. Levanta unicamente el contenedor de la base de datos:
```bash
docker compose up -d db
```
2. Ejecuta el wrapper de Maven para iniciar Spring Boot:
```bash
# En Linux / macOS
./mvnw spring-boot:run

# En Windows
mvnw.cmd spring-boot:run
```

## Ejemplos Basicos de API

Puedes interactuar con el sistema desde otra terminal usando curl o tu cliente HTTP preferido (Postman, Insomnia).

1. Emitir una nueva Tarjeta (Genera una Cuenta):
```bash
curl -X POST http://localhost:8080/api/v1/cards/issue \
-H "Content-Type: application/json" \
-d '{
  "cardId": "TRK-001",
  "fareCategory": "GENERAL",
  "documentNumber": "12345678",
  "kioskAgentId": "123e4567-e89b-12d3-a456-426614174000"
}'
```

2. Recargar saldo a la Tarjeta:
```bash
curl -X POST http://localhost:8080/api/v1/accounts/recharge \
-H "Content-Type: application/json" \
-d '{
  "transactionId": "TX-100",
  "cardId": "TRK-001",
  "amount": 10.00,
  "origin": "KIOSK-1"
}'
```

3. Procesar un lote de viajes (Offline Sync):
```bash
curl -X POST http://localhost:8080/api/v1/trips/batch \
-H "Content-Type: application/json" \
-d '{
  "busId": "ESP32-BUS-01",
  "trips": [
    {
      "tripId": "VIAJE-001",
      "cardId": "TRK-001",
      "fare": 1.20,
      "localTimestamp": "2026-09-30T14:30:00"
    }
  ],
  "firma": "MEUCIQDx7k9...Base64...",
  "claveId": "VALIDADOR-ESP32-BUS-01-v1"
}'
```

## Ejecutando las Pruebas (BDD)

El sistema cuenta con una bateria extensiva de casos de prueba. Las pruebas utilizan su propia base de datos en memoria (H2) configurada dinamicamente, por lo que NO borraran la data de tu PostgreSQL local.

Para ejecutar todas las pruebas automatizadas de integracion:
```bash
./mvnw clean test
```
