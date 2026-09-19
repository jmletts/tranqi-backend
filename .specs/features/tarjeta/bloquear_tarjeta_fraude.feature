Feature: Bloqueo de tarjeta por fraude

  Como oficial de seguridad o administrador
  Quiero aplicar un bloqueo administrativo por fraude a una tarjeta
  Para impedir su uso de forma definitiva e impedir que recupere operatividad con recargas

  Background:
    Given que la tarjeta "TRK-5001" existe con estado "ACTIVE", asociada a la cuenta "CTA-501" con saldo 12.00
    And la tarjeta "TRK-5002" existe con estado "BLOCKED_FRAUDE", asociada a la cuenta "CTA-502" con saldo 0.00
    And la tarjeta "TRK-5003" existe con estado "BLOCKED_DEUDA", asociada a la cuenta "CTA-503" con saldo -3.50

  Scenario: Bloqueo administrativo exitoso de una tarjeta activa por sospecha de fraude
    When el administrador solicita el bloqueo por fraude de la tarjeta "TRK-5001" con motivo "Patrón anómalo de abordajes clonados"
    Then la tarjeta "TRK-5001" pasa al estado "BLOCKED_FRAUDE"
    And la tarjeta "TRK-5001" es enviada a la cola prioritaria de lista negra

  Scenario: El bloqueo por fraude persiste e impide la recarga de saldo
    When se intenta realizar una recarga de 20.00 en la tarjeta "TRK-5002" identificada con la transacción "TRX-501"
    Then la recarga es rechazada porque la tarjeta está bloqueada por fraude
    And la tarjeta "TRK-5002" permanece en estado "BLOCKED_FRAUDE"
    And el saldo de la cuenta "CTA-502" permanece en 0.00

  Scenario: Diferenciación entre bloqueo por deuda y bloqueo por fraude
    When se realiza una recarga de 10.00 en la tarjeta "TRK-5003" identificada con la transacción "TRX-502"
    Then la recarga es procesada exitosamente
    And la tarjeta "TRK-5003" pasa al estado "ACTIVE"
    But la tarjeta "TRK-5002" con bloqueo por fraude no puede pasar a estado "ACTIVE" mediante recargas
