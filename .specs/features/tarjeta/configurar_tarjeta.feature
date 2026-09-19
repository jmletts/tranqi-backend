Feature: Configuración y vinculación de tarjeta a usuario

  Como usuario registrado del sistema
  Quiero vincular una tarjeta activa anónima a mi perfil
  Para administrarla digitalmente manteniendo su cuenta y saldo

  Background:
    Given que el usuario "USR-101" existe en el sistema
    And el usuario "USR-102" existe en el sistema
    And la tarjeta "TRK-3001" existe con estado "ACTIVE", cuenta "CTA-301" con saldo 25.00 y es anónima
    And la tarjeta "TRK-3002" existe con estado "ACTIVE", cuenta "CTA-302" con saldo 10.00 y está vinculada a "USR-101"
    And la tarjeta "TRK-3003" existe con estado "EN_INVENTARIO" y es anónima
    And la tarjeta "TRK-3004" existe con estado "BLOCKED_FRAUDE", cuenta "CTA-304" y es anónima

  Scenario: Vinculación exitosa de tarjeta anónima a un usuario
    When el usuario "USR-101" solicita vincular la tarjeta "TRK-3001"
    Then la tarjeta "TRK-3001" queda vinculada al usuario "USR-101"
    And la tarjeta "TRK-3001" conserva la cuenta "CTA-301" con saldo 25.00
    And no se crea ninguna cuenta nueva en el sistema

  Scenario: Un usuario puede vincular múltiples tarjetas a su perfil
    When el usuario "USR-101" solicita vincular la tarjeta "TRK-3001"
    Then el usuario "USR-101" tiene administradas las tarjetas "TRK-3001" y "TRK-3002"

  Scenario: Rechazo al intentar vincular una tarjeta que ya tiene un usuario asignado
    When el usuario "USR-102" solicita vincular la tarjeta "TRK-3002"
    Then la solicitud de vinculación es rechazada porque la tarjeta ya tiene un propietario
    And la tarjeta "TRK-3002" permanece vinculada a "USR-101"

  Scenario: Rechazo al intentar vincular una tarjeta que se encuentra en inventario
    When el usuario "USR-101" solicita vincular la tarjeta "TRK-3003"
    Then la solicitud de vinculación es rechazada porque la tarjeta no ha sido activada

  Scenario: Rechazo al intentar vincular una tarjeta bloqueada por fraude
    When el usuario "USR-101" solicita vincular la tarjeta "TRK-3004"
    Then la solicitud de vinculación es rechazada porque la tarjeta presenta bloqueo administrativo
