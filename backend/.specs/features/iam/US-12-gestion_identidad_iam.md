# US-12: Gestión de Identidad y Roles Aditivos (IAM)

## Descripción
**Como** plataforma Tranki,  
**Quiero** gestionar una única identidad de usuario (User) con capacidad de tener múltiples roles aditivos (RBAC),  
**Para** evitar la duplicación de datos de personas que son pasajeros y a la vez personal operativo, asegurando el acceso mediante JWT y contraseñas protegidas.

---

## Análisis DDD (Domain-Driven Design)
* **Agregado Raíz (Aggregate Root):** `User` (Representa a la persona física).
* **Entidades:** Ninguna interna compleja, los roles se manejan como lista de Value Objects o Enums.
* **Objetos de Valor (Value Objects):** 
  - `Dni` (Identificador único nacional, validación de formato).
  - `Email` (Validación de formato).
  - `PasswordHash` (Encapsula la lógica de Bcrypt).
  - `Role` (`USUARIO_FINAL`, `AGENTE_KIOSKO`, `GESTOR_FLOTA`).
* **Reglas de Invariancia:**
  - El Dni debe ser único en todo el sistema.
  - Al auto-registrarse por endpoint público, el usuario SOLO puede recibir el rol `USUARIO_FINAL`.
  - Roles administrativos se otorgan por un endpoint privado protegido.

---

## Reglas de Negocio
1. **Auto-Registro (Público):** Requiere DNI, Nombre, Teléfono, Correo, Edad, Dirección, Tarifa Base y Contraseña en texto plano (que se hashea con Bcrypt antes de persistir). Rol asignado: `USUARIO_FINAL`.
2. **Autenticación:** Endpoint `/api/v1/auth/login` recibe DNI y contraseña. Devuelve un JWT firmado con un secreto asimétrico o simétrico fuerte, incluyendo los roles en el payload.
3. **Protección de Endpoints:** Los controladores deben validar el JWT en el header `Authorization: Bearer <token>`.
