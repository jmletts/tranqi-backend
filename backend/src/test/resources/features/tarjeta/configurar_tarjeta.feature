Feature: Vinculación de tarjeta activa anónima a un usuario

  Como usuario registrado en la aplicación
  Quiero vincular una tarjeta de transporte anónima a mi perfil usando su código de seguridad
  Para administrar su saldo, historial y transferencias desde los canales digitales sin perder la cuenta ni el saldo existente

  Background:
    Given que el usuario "USR-101" existe en el sistema
    And el usuario "USR-102" existe en el sistema
    And la tarjeta "TRK-3001" existe con estado "ACTIVE", cuenta "CTA-301" con saldo 25.00, "userId" nulo y "securityCodeHash" correspondiente al código "4321"
    And la tarjeta "TRK-3002" existe con estado "ACTIVE", cuenta "CTA-302" con saldo 10.00 y "userId" igual a "USR-101"
    And la tarjeta "TRK-3003" existe con estado "EN_INVENTARIO" y "userId" nulo
    And la tarjeta "TRK-3004" existe con estado "BLOQUEADA_FRAUDE", cuenta "CTA-304" y "userId" nulo

  Scenario: Vinculación exitosa de tarjeta anónima a un usuario con código correcto
    When el usuario "USR-101" solicita vincular la tarjeta "TRK-3001" proporcionando el código de seguridad "4321"
    Then la cuenta "CTA-301" queda con "userId" igual a "USR-101"
    And la tarjeta "TRK-3001" conserva la cuenta "CTA-301" con saldo 25.00 sin modificaciones
    And no se crea ninguna cuenta nueva en el sistema
    And se emite el evento "CuentaVinculadaAUsuario"

  Scenario: Un usuario puede administrar múltiples tarjetas simultáneamente
    When el usuario "USR-101" solicita vincular la tarjeta "TRK-3001" proporcionando el código de seguridad "4321"
    Then el usuario "USR-101" administra simultáneamente las cuentas de las tarjetas "TRK-3001" y "TRK-3002"

  Scenario: Rechazo de vinculación por código de seguridad incorrecto
    When el usuario "USR-101" intenta vincular la tarjeta "TRK-3001" proporcionando el código de seguridad "9999" incorrecto
    Then la solicitud de vinculación es rechazada por código de seguridad inválido
    And la cuenta "CTA-301" permanece con "userId" nulo
    And se emite el evento "VinculacionRechazadaPorCodigoInvalido"

  Scenario: La validación del código de seguridad se realiza contra el hash almacenado, nunca en texto plano
    When el usuario "USR-101" intenta vincular la tarjeta "TRK-3001" con cualquier código de seguridad
    Then el sistema compara el código proporcionado contra el "securityCodeHash" almacenado, sin exponer el valor original

  Scenario: Bloqueo de vinculación tras cinco intentos fallidos consecutivos
    Given que el usuario "USR-101" ya realizó 4 intentos fallidos de vinculación sobre la tarjeta "TRK-3001"
    When el usuario "USR-101" intenta vincular la tarjeta "TRK-3001" proporcionando el código de seguridad "8888" incorrecto por quinta vez
    Then la solicitud de vinculación es rechazada definitivamente por exceso de intentos
    And la tarjeta "TRK-3001" queda bloqueada para nuevos intentos de vinculación
    And se emite el evento "VinculacionBloqueadaPorIntentosExcedidos"

  Scenario: Rechazo de vinculación de una tarjeta que ya tiene un usuario asignado
    When el usuario "USR-102" intenta vincular la tarjeta "TRK-3002" proporcionando cualquier código de seguridad
    Then la solicitud de vinculación es rechazada porque la tarjeta ya tiene un propietario asignado
    And la cuenta "CTA-302" permanece con "userId" igual a "USR-101"

  Scenario: Rechazo de vinculación de una tarjeta en estado EN_INVENTARIO
    When el usuario "USR-101" intenta vincular la tarjeta "TRK-3003" proporcionando cualquier código de seguridad
    Then la solicitud de vinculación es rechazada porque la tarjeta no ha sido activada en ningún kiosco

  Scenario: Rechazo de vinculación de una tarjeta bloqueada por fraude
    When el usuario "USR-101" intenta vincular la tarjeta "TRK-3004" proporcionando cualquier código de seguridad
    Then la solicitud de vinculación es rechazada porque la tarjeta presenta bloqueo administrativo por fraude
