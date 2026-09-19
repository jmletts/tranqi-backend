Feature: Reporte de tarjeta perdida y emisión de reemplazo

  Como usuario titular de una tarjeta de transporte
  Quiero reportar la pérdida o robo de mi tarjeta actual
  Para bloquear el plástico extraviado y heredar mis datos y saldo en una nueva tarjeta

  Background:
    Given que el usuario "USR-201" existe en el sistema
    And la tarjeta "TRK-4001" existe con estado "ACTIVE", categoría "ESTUDIANTE", vinculada al usuario "USR-201" y asociada a la cuenta "CTA-401" con saldo 48.50
    And la tarjeta "TRK-4002" existe en el sistema con estado "EN_INVENTARIO"
    And la tarjeta "TRK-4003" existe con estado "ACTIVE" pero es anónima y asociada a la cuenta "CTA-403" con saldo 15.00
    And la tarjeta "TRK-4004" existe con estado "BLOCKED_PERDIDA", vinculada al usuario "USR-201"

  Scenario: Reporte exitoso de tarjeta perdida con emisión de reemplazo y herencia completa
    When el usuario "USR-201" reporta como perdida la tarjeta "TRK-4001" solicitando el reemplazo con la tarjeta de inventario "TRK-4002"
    Then la tarjeta "TRK-4001" pasa a estado "BLOCKED_PERDIDA"
    And la tarjeta "TRK-4001" es añadida a la lista negra
    And la tarjeta "TRK-4002" pasa a estado "ACTIVE"
    And la tarjeta "TRK-4002" queda vinculada al usuario "USR-201"
    And la tarjeta "TRK-4002" hereda la categoría "ESTUDIANTE"
    And la tarjeta "TRK-4002" queda asociada a la cuenta "CTA-401" con saldo 48.50

  Scenario: Rechazo de reporte de pérdida para una tarjeta anónima
    When se solicita reportar pérdida de la tarjeta "TRK-4003" anónima
    Then la solicitud es rechazada porque las tarjetas anónimas no admiten reporte digital de pérdida
    And la tarjeta "TRK-4003" permanece en estado "ACTIVE"

  Scenario: Rechazo al intentar reportar una tarjeta previamente bloqueada por pérdida
    When el usuario "USR-201" reporta como perdida la tarjeta "TRK-4004"
    Then la solicitud es rechazada porque la tarjeta ya se encuentra en estado terminal de pérdida
