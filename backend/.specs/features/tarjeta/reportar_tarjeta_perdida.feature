Feature: Reporte de tarjeta perdida y emisión de tarjeta de reemplazo

  Como usuario titular de una tarjeta de transporte vinculada a su perfil
  Quiero reportar la pérdida o robo de mi tarjeta actual y solicitar un reemplazo físico
  Para bloquear inmediatamente el plástico extraviado y continuar operando con la misma cuenta, saldo y categoría tarifaria

  Background:
    Given que el usuario "USR-201" existe en el sistema
    And la tarjeta "TRK-4001" existe con estado "ACTIVE", asociada a la cuenta "CTA-401" con saldo 48.50 y "userId" igual a "USR-201"
    And la cuenta "CTA-401" tiene "fareCategory" igual a "ESCOLAR"
    And la tarjeta "TRK-4002" existe en el sistema con estado "EN_INVENTARIO"
    And la tarjeta "TRK-4003" existe con estado "ACTIVE", asociada a la cuenta "CTA-403" con saldo 15.00 y "userId" nulo
    And la tarjeta "TRK-4004" existe con estado "LOST_REPORTED" y "userId" igual a "USR-201"

  Scenario: Reporte exitoso de tarjeta perdida y emisión de tarjeta de reemplazo
    When el usuario "USR-201" reporta como perdida la tarjeta "TRK-4001" solicitando el reemplazo con la tarjeta de inventario "TRK-4002"
    Then la tarjeta "TRK-4001" pasa al estado "LOST_REPORTED"
    And la tarjeta "TRK-4001" es añadida a la lista negra con motivo "PERDIDA_ROBO"
    And se emite el evento "TarjetaReportadaComoPerdida"

  Scenario: La tarjeta de reemplazo apunta al mismo "accountId" sin copiar datos de la Cuenta
    Given que el usuario "USR-201" acaba de reportar como perdida la tarjeta "TRK-4001" con reemplazo "TRK-4002"
    When se verifica la tarjeta de reemplazo "TRK-4002"
    Then la tarjeta "TRK-4002" tiene el mismo "accountId" que tenía la tarjeta "TRK-4001", es decir "CTA-401"
    And la tarjeta "TRK-4002" pasa al estado "ACTIVE"
    And la cuenta "CTA-401" conserva su saldo de 48.50 sin ninguna modificación
    And la cuenta "CTA-401" conserva su "fareCategory" igual a "ESCOLAR" sin ninguna copia manual
    And la cuenta "CTA-401" conserva su "userId" igual a "USR-201" sin ninguna copia manual
    And se emite el evento "TarjetaDeReemplazoApuntaAMismaCuenta"

  Scenario: Rechazo de reporte de pérdida para una tarjeta anónima
    When se solicita reportar la pérdida de la tarjeta anónima "TRK-4003"
    Then la solicitud es rechazada porque las tarjetas anónimas no admiten reporte digital de pérdida por falta de titularidad acreditable
    And la tarjeta "TRK-4003" permanece en estado "ACTIVE"

  Scenario: Rechazo al intentar reportar una tarjeta que ya se encuentra en estado LOST_REPORTED
    When el usuario "USR-201" intenta reportar como perdida la tarjeta "TRK-4004"
    Then la solicitud es rechazada porque la tarjeta ya se encuentra en estado terminal de pérdida
