Feature: Cambio de categoría tarifaria de tarjeta

  Como usuario o administrador del sistema
  Quiero actualizar la categoría tarifaria de una tarjeta activa
  Para aplicar la tarifa correspondiente según la documentación acreditada

  Background:
    Given que la tarjeta "TRK-2001" existe con estado "ACTIVE", asociada a la cuenta "CTA-201" y categoría "GENERAL"
    And la tarjeta "TRK-2002" existe con estado "BLOCKED_FRAUDE", asociada a la cuenta "CTA-202" y categoría "GENERAL"
    And la tarjeta "TRK-2003" existe con estado "BLOCKED_PERDIDA", asociada a la cuenta "CTA-203" y categoría "GENERAL"
    And la tarjeta "TRK-2004" existe con estado "ACTIVE", asociada a la cuenta "CTA-204" y categoría "ESTUDIANTE"

  Scenario: Actualización exitosa a categoría estudiante con documento válido
    When se solicita cambiar la categoría de la tarjeta "TRK-2001" a "ESTUDIANTE" con documento universitario "DOC-EST-2026" vigente
    Then la tarjeta "TRK-2001" actualiza su categoría tarifaria a "ESTUDIANTE"
    And la cuenta "CTA-201" mantiene su saldo intacto

  Scenario: Actualización exitosa a categoría adulto mayor con edad acreditada
    When se solicita cambiar la categoría de la tarjeta "TRK-2001" a "ADULTO_MAYOR" con documento acreditando 68 años
    Then la tarjeta "TRK-2001" actualiza su categoría tarifaria a "ADULTO_MAYOR"
    And la cuenta "CTA-201" mantiene su saldo intacto

  Scenario: Rechazo de cambio a categoría estudiante con documento inválido
    When se solicita cambiar la categoría de la tarjeta "TRK-2001" a "ESTUDIANTE" con documento universitario "DOC-INVALIDO"
    Then la solicitud de cambio de categoría es rechazada
    And la tarjeta "TRK-2001" mantiene su categoría original "GENERAL"

  Scenario: Rechazo de cambio de categoría en tarjeta bloqueada por fraude
    When se solicita cambiar la categoría de la tarjeta "TRK-2002" a "ESTUDIANTE" con documento universitario "DOC-EST-2026" vigente
    Then la solicitud es rechazada debido a que la tarjeta está bloqueada por fraude
    And la tarjeta "TRK-2002" mantiene el estado "BLOCKED_FRAUDE"
    And la tarjeta "TRK-2002" mantiene la categoría "GENERAL"

  Scenario: Rechazo de cambio de categoría en tarjeta reportada como perdida
    When se solicita cambiar la categoría de la tarjeta "TRK-2003" a "GENERAL"
    Then la solicitud es rechazada debido a que la tarjeta está reportada como perdida
    And la tarjeta "TRK-2003" mantiene el estado "BLOCKED_PERDIDA"

  Scenario: Retorno a categoría general sin requerir documento
    When se solicita cambiar la categoría de la tarjeta "TRK-2004" a "GENERAL"
    Then la tarjeta "TRK-2004" actualiza su categoría tarifaria a "GENERAL"
