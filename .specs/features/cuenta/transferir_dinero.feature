Feature: Transferencia de saldo entre cuentas del mismo usuario

  Como usuario registrado con varias tarjetas administradas
  Quiero transferir saldo entre las cuentas de mis tarjetas
  Para redistribuir mis fondos disponibles sin exceder el límite de margen de deuda y respetando la titularidad

  # Supuesto explícito: en esta fase no se permiten transferencias a cuentas de terceros.
  # Solo se puede transferir entre cuentas cuyo "userId" coincide con el del usuario que ejecuta la operación.

  Background:
    Given que el usuario "USR-301" existe en el sistema
    And el usuario "USR-302" existe en el sistema
    And la tarjeta "TRK-7001" existe con estado "ACTIVE", asociada a la cuenta "CTA-701" con saldo 50.00 y "userId" igual a "USR-301"
    And la tarjeta "TRK-7002" existe con estado "ACTIVE", asociada a la cuenta "CTA-702" con saldo 10.00 y "userId" igual a "USR-301"
    And la tarjeta "TRK-7003" existe con estado "ACTIVE", asociada a la cuenta "CTA-703" con saldo -5.00 y "userId" igual a "USR-301"
    And la tarjeta "TRK-7004" existe con estado "ACTIVE", asociada a la cuenta "CTA-704" con saldo 20.00 y "userId" igual a "USR-302"
    And la tarjeta "TRK-7005" existe con estado "LOST_REPORTED", asociada a la cuenta "CTA-705" con saldo 15.00 y "userId" igual a "USR-301"
    And la tarjeta "TRK-7006" existe con estado "BLOQUEADA_FRAUDE", asociada a la cuenta "CTA-706" con saldo 30.00 y "userId" igual a "USR-301"
    And la tarjeta "TRK-7007" existe con estado "ACTIVE", asociada a la cuenta "CTA-707" con saldo 8.00 y "userId" nulo
    And el "debtMarginLimit" de todas las cuentas de "USR-301" es de -3.00

  Scenario: Transferencia exitosa entre dos cuentas del mismo usuario
    When el usuario "USR-301" transfiere 15.00 desde la cuenta "CTA-701" hacia la cuenta "CTA-702"
    Then el saldo de la cuenta "CTA-701" pasa a ser 35.00
    And el saldo de la cuenta "CTA-702" pasa a ser 25.00
    And se emite el evento "TransferenciaConfirmada"

  Scenario: El monto de la transferencia debe ser mayor a cero
    When el usuario "USR-301" intenta transferir 0.00 desde la cuenta "CTA-701" hacia la cuenta "CTA-702"
    Then la transferencia es rechazada porque el monto debe ser mayor a cero
    And el saldo de la cuenta "CTA-701" se mantiene en 50.00
    And el saldo de la cuenta "CTA-702" se mantiene en 10.00

  Scenario: Rechazo de transferencia si la cuenta origen queda por debajo del límite de margen de deuda
    When el usuario "USR-301" intenta transferir 54.00 desde la cuenta "CTA-701" hacia la cuenta "CTA-702"
    Then la transferencia es rechazada porque la cuenta origen quedaría por debajo del "debtMarginLimit" de -3.00
    And el saldo de la cuenta "CTA-701" se mantiene en 50.00
    And el saldo de la cuenta "CTA-702" se mantiene en 10.00
    And se emite el evento "TransferenciaRechazadaPorLimiteDeuda"

  Scenario: Rechazo de transferencia hacia una cuenta cuyo "userId" no pertenece al usuario ejecutor
    When el usuario "USR-301" intenta transferir 10.00 desde la cuenta "CTA-701" hacia la cuenta "CTA-704"
    Then la transferencia es rechazada porque la cuenta destino no está autorizada para este usuario
    And se emite el evento "TransferenciaRechazadaPorCuentaNoAutorizada"

  Scenario: Rechazo de transferencia desde una cuenta cuyo "userId" no pertenece al usuario ejecutor
    When el usuario "USR-301" intenta transferir 10.00 desde la cuenta "CTA-704" hacia la cuenta "CTA-701"
    Then la transferencia es rechazada porque la cuenta origen no está autorizada para este usuario
    And se emite el evento "TransferenciaRechazadaPorCuentaNoAutorizada"

  Scenario: Rechazo de transferencia cuando la tarjeta de la cuenta origen está en estado LOST_REPORTED
    When el usuario "USR-301" intenta transferir 10.00 desde la cuenta "CTA-705" hacia la cuenta "CTA-701"
    Then la transferencia es rechazada porque la tarjeta asociada a la cuenta origen está en estado "LOST_REPORTED"
    And se emite el evento "TransferenciaRechazadaPorCuentaNoAutorizada"

  Scenario: Rechazo de transferencia cuando la tarjeta de la cuenta destino está en estado BLOQUEADA_FRAUDE
    When el usuario "USR-301" intenta transferir 10.00 desde la cuenta "CTA-701" hacia la cuenta "CTA-706"
    Then la transferencia es rechazada porque la tarjeta asociada a la cuenta destino está en estado "BLOQUEADA_FRAUDE"
    And se emite el evento "TransferenciaRechazadaPorCuentaNoAutorizada"
