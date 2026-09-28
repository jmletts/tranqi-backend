# 🚌 Tranki - Backend Central de Recaudo

**Tranki** es el motor central (backend) de un sistema de recaudo para transporte público. Está diseñado para gestionar transacciones de tarjetas NFC, administrar saldos de cuentas de usuarios y reconciliar viajes de manera robusta, soportando la sincronización masiva de viajes (batch processing) generados por validadores físicos (ESP32) que operan con conectividad intermitente (offline-first).

## 🏛️ Arquitectura y Metodología

El proyecto ha sido concebido bajo prácticas rigurosas de desarrollo de software:
- **Domain-Driven Design (DDD) y Arquitectura Hexagonal:** Lógica de negocio 100% aislada de frameworks externos y bases de datos (`Ports & Adapters`).
- **CQRS (Command Query Responsibility Segregation):** Separación de los modelos de escritura (validación y cálculo de saldos) y de lectura (historial de movimientos proyectado).
- **Behavior-Driven Development (BDD):** Tests vivos escritos en sintaxis Gherkin (Cucumber) que fungen tanto como pruebas de integración robustas, como documentación funcional del sistema validada por negocio.

## 📦 Módulos Principales

1. **Card (`/card`):** Emisión, asignación de usuarios, cambios de categorías tarifarias (Estudiante, General) y bloqueos (por pérdida, fraude o exceso de deuda).
2. **Account (`/account`):** Gestión central del balance financiero, recargas idempotentes, transferencias seguras entre tarjetas de un mismo titular e historiales de movimiento inmutables.
3. **Trip (`/trip`):** Procesamiento de lotes de pasajes cobrados offline en los buses, asegurando idempotencia contra re-envíos por fallas de red y bloqueos automáticos en caso de deudas sobregiradas.

## 🚀 Cómo correr el proyecto en local

### Pre-requisitos
* **Java 21** instalado en tu sistema.
* Puerto `8080` disponible.

### Levantando el servidor (Spring Boot)

El proyecto está configurado para utilizar H2 (Base de Datos en Memoria) en el perfil por defecto, por lo que **no requieres instalar Docker ni bases de datos externas** para probarlo localmente. La base de datos iniciará limpia cada vez que arranques el servidor.

1. Abre tu terminal y sitúate en la raíz del repositorio.
2. Ejecuta el *wrapper* de Maven para levantar Spring Boot:

```bash
# En Linux / macOS
./mvnw spring-boot:run

# En Windows
mvnw.cmd spring-boot:run
```

3. El servidor estará escuchando de forma inmediata en `http://localhost:8080`.

---

## 🛠️ Ejemplos Básicos de API

Puedes interactuar con el sistema desde otra terminal usando `curl` o tu cliente HTTP preferido (Postman, Insomnia). Aquí te presentamos el flujo básico:

**1. Emitir una nueva Tarjeta (Genera una Cuenta):**
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
*(Almacena el `accountId` retornado por este endpoint, lo necesitarás para las lecturas).*

**2. Recargar saldo a la Tarjeta:**
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

**3. Procesar un lote de viajes (Offline Sync):**
```bash
curl -X POST http://localhost:8080/api/v1/trips/batch \
-H "Content-Type: application/json" \
-d '{
  "busId": "BUS-201",
  "trips": [
    {
      "tripId": "VIA-001",
      "cardId": "TRK-001",
      "fare": 1.20,
      "localTimestamp": "2026-09-27T10:00:00"
    }
  ]
}'
```

**4. Consultar Movimientos (CQRS):**
```bash
# Reemplaza {accountId} con el ID obtenido en el paso 1
curl -X GET http://localhost:8080/api/v1/accounts/{accountId}/movements
```

## 🧪 Ejecutando las Pruebas (BDD)

El sistema cuenta con una batería extensiva de casos de prueba escritos en formato Gherkin en `src/test/resources/features`. Estos testean desde contaminación de estado en base de datos, idempotencia estricta en las recargas y viajes, hasta reglas complejas de categorías tarifarias.

Para ejecutar todas las pruebas automatizadas de integración:

```bash
./mvnw clean test
```
