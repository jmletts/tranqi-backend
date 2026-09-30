Feature: Gestión de Identidad Única y Roles Aditivos (IAM)

  Scenario: Registro exitoso de un pasajero (Auto-registro con campos obligatorios)
    Given que un visitante provee sus datos personales:
      | DNI       | 12345678          |
      | Nombre    | Juan Perez        |
      | Telefono  | 0991234567        |
      | Correo    | juan@email.com    |
      | Edad      | 30                |
      | Direccion | Calle Falsa 123   |
      | Tarifa    | GENERAL           |
    And provee la contrasena en texto plano "secreta123"
    When intenta registrarse en el sistema por el endpoint publico
    Then la cuenta se crea exitosamente
    And la contrasena se guarda protegida con el algoritmo Bcrypt
    And se le asigna unicamente el rol base "USUARIO_FINAL"

  Scenario: Asignacion de roles adicionales sin duplicar identidad
    Given un usuario ya registrado con DNI "12345678" y rol "USUARIO_FINAL"
    And un administrador autenticado en el sistema
    When el administrador le otorga el rol de "AGENTE_KIOSKO" al usuario "12345678"
    Then el usuario mantiene su misma identidad y DNI
    And el usuario ahora posee los roles "USUARIO_FINAL" y "AGENTE_KIOSKO" simultaneamente

  Scenario: Inicio de sesión exitoso devuelve JWT
    Given un usuario registrado con DNI "12345678" y contrasena "secreta123"
    And que posee los roles "USUARIO_FINAL" y "AGENTE_KIOSKO"
    When intenta iniciar sesion con credenciales correctas
    Then el sistema genera y devuelve un token JWT
    And el token incluye todos sus roles asignados en el payload

  Scenario: Acceso denegado a endpoint protegido de Gestor de Flota sin el rol adecuado
    Given un usuario autenticado solo con el rol "USUARIO_FINAL"
    When intenta acceder al endpoint protegido para consultar ganancias de buses
    Then el sistema responde con error 403 Forbidden
