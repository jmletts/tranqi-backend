Feature: Bloqueo de tarjeta por fraude

  Como oficial de seguridad o administrador del sistema
  Quiero aplicar un bloqueo definitivo por fraude a una tarjeta sospechosa
  Para impedir su uso de forma permanente y evitar que una recarga pueda reactivarla

  Background:
    Given que la tarjeta "TRK-5001" existe con estado "ACTIVE", asociada a la cuenta "CTA-501" con saldo 12.00
    And la tarjeta "TRK-5002" existe con estado "BLOQUEADA_FRAUDE", asociada a la cuenta "CTA-502" con saldo 0.00
    And la tarjeta "TRK-5003" existe con estado "ACTIVE", asociada a la cuenta "CTA-503" con saldo -3.50

  Scenario: Bloqueo administrativo exitoso de una tarjeta activa por sospecha de fraude
    When el administrador solicita el bloqueo por fraude de la tarjeta "TRK-5001" con motivo "Patrón anómalo de abordajes clonados"
    Then la tarjeta "TRK-5001" pasa al estado "BLOQUEADA_FRAUDE"
    And la tarjeta "TRK-5001" es publicada de inmediato en la lista negra con prioridad alta
    And se emite el evento "TarjetaBloqueadaPorFraude"

  Scenario: El bloqueo por fraude persiste e impide la recarga de saldo
    When se procesa una recarga con identificador "TRX-501" por un monto de 20.00 en la tarjeta "TRK-5002" con origen "KIOSCO"
    Then la solicitud de recarga es rechazada porque la tarjeta está bloqueada por fraude
    And la tarjeta "TRK-5002" permanece en estado "BLOQUEADA_FRAUDE"
    And el saldo de la cuenta "CTA-502" permanece en 0.00

  Scenario: El bloqueo por fraude nunca se levanta automáticamente, solo mediante revisión administrativa explícita
    Given que la tarjeta "TRK-5002" en estado "BLOQUEADA_FRAUDE" recibe recargas sucesivas
    When se procesan tres recargas consecutivas de 10.00 sobre la tarjeta "TRK-5002"
    Then la tarjeta "TRK-5002" permanece en estado "BLOQUEADA_FRAUDE" después de todas las recargas
    And ninguna recarga es acreditada en la cuenta "CTA-502"

  Scenario: Diferenciación entre bloqueo por deuda y bloqueo por fraude ante una recarga
    When se procesa una recarga con identificador "TRX-503" por un monto de 10.00 en la tarjeta "TRK-5003" con origen "KIOSCO"
    Then la recarga es acreditada exitosamente en la cuenta "CTA-503"
    And la tarjeta "TRK-5003" pasa al estado "ACTIVE"
    But la tarjeta "TRK-5002" con estado "BLOQUEADA_FRAUDE" nunca puede pasar a "ACTIVE" mediante una recarga
