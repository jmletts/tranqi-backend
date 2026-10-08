# Prompt de Orquestación: Refactorización a Grado de Producción (Tranki Backend)

Eres Antigravity, un agente experto en Java, Spring Boot, Domain-Driven Design (DDD), Arquitectura Hexagonal y Seguridad.

Se te solicita implementar tres nuevos bloques fundamentales para el proyecto "Tranki" (un sistema de recaudo de transporte público) basándote en los archivos `.specs` proporcionados. No debes romper la estructura Hexagonal existente.

## Contexto y Reglas Generales
- **Arquitectura:** Hexagonal (Ports & Adapters) + CQRS.
- **Pruebas:** Behavior-Driven Development (BDD) con Cucumber. No programes nada sin que los `.feature` pasen.
- **Base de Datos:** PostgreSQL con Spring Data JPA.
- **Seguridad:** Criptografía Asimétrica (ECDSA) para IoT y JWT para la API Web.

## Tarea 1: Módulo de Identidad (IAM)
Implementa la especificación definida en `.specs/features/iam/US-12-gestion_identidad_iam.md`:
1. Crea el dominio `User`. Atributos: UUID, DNI (unique), Nombre, Correo, Teléfono, Edad, Dirección, Tarifa Base.
2. Implementa un modelo de roles aditivos (`UsuarioRol`): `USUARIO_FINAL`, `AGENTE_KIOSKO`, `GESTOR_FLOTA`.
3. Crea un endpoint público de auto-registro que **solo** otorgue el rol `USUARIO_FINAL`. 
4. Hashea las contraseñas con **Bcrypt** antes de persistirlas.
5. Implementa el login (`/api/v1/auth/login`) que devuelva un JWT con los roles en el payload.
6. Protege los endpoints existentes verificando el token JWT.

## Tarea 2: Módulo de Flota Operativa
Implementa la especificación `.specs/features/flota/US-13-gestion_flota.md`:
1. Crea el dominio `Bus` con `LicensePlate` (unique) y `PublicKey` (para validar firmas del ESP32).
2. Endpoint protegido (requiere rol `GESTOR_FLOTA`) para registrar buses.
3. Endpoint protegido (requiere rol `GESTOR_FLOTA`) para consultar ganancias acumuladas por placa.

## Tarea 3: Seguridad Zero-Trust (IoT Criptografía)
Implementa la especificación `.specs/features/validador/US-14-verificacion_criptografica.md`:
1. Actualiza el endpoint `POST /api/v1/trips/batch`. El payload debe incluir `firma` (Base64) y `claveId`.
2. Implementa un Domain Service que intercepte la petición, busque el bus mediante `claveId`, extraiga su `PublicKey` y verifique la firma ECDSA asimétrica del payload.
3. Si la firma es inválida, lanza inmediatamente una excepción de seguridad (HTTP 401/403). El flujo se detiene ANTES de evaluar idempotencia o tocar el saldo.

## Pasos de Ejecución Esperados
1. Generar e implementar las entidades y value objects (Dominio).
2. Crear los Repositorios y Puertos (Ports).
3. Escribir los Casos de Uso (Application Layer).
4. Implementar los Adaptadores Web y de Persistencia.
5. Crear y enlazar los `Steps` de Cucumber para que los `.feature` pasen exitosamente.
