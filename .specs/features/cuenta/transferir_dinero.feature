Feature: Transferencia de saldo entre cuentas del mismo usuario

  Como usuario registrado con varias tarjetas
  Quiero transferir saldo entre las cuentas de mis tarjetas administradas
  Para redistribuir mis fondos disponibles respetando las reglas de deuda y titularidad

  Background:
    Given que el usuario "USR-301" existe en el sistema
    And el usuario "USR-302" existe en el sistema
    And la tarjeta "TRK-7001" con cuenta "CTA-701" tiene saldo 50.00 y está vinculada a "USR-301" en estado "ACTIVE"
    And la tarjeta "TRK-7002" con cuenta "CTA-702" tiene saldo 10.00 y está vinculada a "USR-301" en estado "ACTIVE"
    And la tarjeta "TRK-7003" con cuenta "CTA-703" tiene saldo -5.00 y está vinculada a "USR-301" en estado "BLOCKED_DEUDA"
    And la tarjeta "TRK-7004" con cuenta "CTA-704" tiene saldo 20.00 y está vinculada a "USR-302" en estado "ACTIVE"
    And la tarjeta "TRK-7005" con cuenta "CTA-705" tiene saldo 195.00 y está vinculada a "USR-301" en estado "ACTIVE"
    And la tarjeta "TRK-7006" con cuenta "CTA-706" tiene saldo 30.00 y es anónima en estado "ACTIVE"

  Scenario: Transferencia exitosa entre dos tarjetas del mismo usuario
    When el usuario "USR-301" transfiere 15.00 desde la tarjeta "TRK-7001" hacia la tarjeta "TRK-7002"
    Then el saldo de la cuenta "CTA-701" pasa a ser 35.00
    And el saldo de la cuenta "CTA-702" pasa a ser 25.00

  Scenario: Transferencia hacia tarjeta en deuda que levanta el bloqueo
    When el usuario "USR-301" transfiere 12.00 desde la tarjeta "TRK-7001" hacia la tarjeta "TRK-7003"
    Then el saldo de la cuenta "CTA-701" pasa a ser 38.00
    And el saldo de la cuenta "CTA-703" pasa a ser 7.00
    And la tarjeta "TRK-7003" pasa al estado "ACTIVE"

  Scenario: Rechazo de transferencia si el saldo disponible en origen es insuficiente
    When el usuario "USR-301" transfiere 60.00 desde la tarjeta "TRK-7001" hacia la tarjeta "TRK-7002"
    Then la transferencia es rechazada por fondos insuficientes en la cuenta origen
    And el saldo de la cuenta "CTA-701" se mantiene en 50.00
    And el saldo de la cuenta "CTA-702" se mantiene en 10.00

  Scenario: Rechazo de transferencia hacia una tarjeta perteneciente a otro usuario
    When el usuario "USR-301" intenta transferir 10.00 desde la tarjeta "TRK-7001" hacia la tarjeta "TRK-7004"
    Then la transferencia es rechazada porque la tarjeta destino no pertenece al mismo usuario

  Scenario: Rechazo de transferencia si alguna tarjeta involucrada es anónima
    When el usuario "USR-301" intenta transferir 10.00 desde la tarjeta "TRK-7001" hacia la tarjeta "TRK-7006"
    Then la transferencia es rechazada porque no se permiten transferencias con tarjetas anónimas

  Scenario: Rechazo de transferencia si se supera el saldo máximo permitido en destino
    When el usuario "USR-301" intenta transferir 20.00 desde la tarjeta "TRK-7001" hacia la tarjeta "TRK-7005"
    Then la transferencia es rechazada porque supera el saldo máximo de 200.00 en la cuenta destino
