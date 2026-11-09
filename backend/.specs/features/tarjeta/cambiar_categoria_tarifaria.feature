Feature: Cambio de categoría tarifaria de una cuenta

  Como agente de kiosco del sistema de recaudo
  Quiero actualizar la categoría tarifaria de la cuenta asociada a una tarjeta activa
  Para que el pasajero pague la tarifa correcta según la documentación acreditada en el momento del cambio

  Background:
    Given que el agente de kiosco "AGT-001" opera en el punto de recarga "PRC-001"
    And la tarjeta "TRK-2001" existe con estado "ACTIVE", asociada a la cuenta "CTA-201" con "fareCategory" igual a "GENERAL"
    And la tarjeta "TRK-2002" existe con estado "LOST_REPORTED", asociada a la cuenta "CTA-202" con "fareCategory" igual a "GENERAL"
    And la tarjeta "TRK-2003" existe con estado "BLOQUEADA_FRAUDE", asociada a la cuenta "CTA-203" con "fareCategory" igual a "GENERAL"
    And la tarjeta "TRK-2004" existe con estado "ACTIVE", asociada a la cuenta "CTA-204" con "fareCategory" igual a "ESCOLAR"

  @TC-008 @US-02
  Scenario: Actualización exitosa de GENERAL a ESCOLAR con DNI válido
    When el agente "AGT-001" solicita cambiar la categoría de la cuenta "CTA-201" a "ESCOLAR" presentando DNI "DOC-DNI-2026" vigente
    Then la cuenta "CTA-201" actualiza su "fareCategory" a "ESCOLAR"
    And el saldo de la cuenta "CTA-201" no es modificado
    And se emite el evento "CategoriaTarifariaActualizada"

  @TC-009 @US-02
  Scenario: Actualización exitosa de GENERAL a UNIVERSITARIO con carnet válido
    When el agente "AGT-001" solicita cambiar la categoría de la cuenta "CTA-201" a "UNIVERSITARIO" presentando carnet universitario "DOC-CARNET-2026" vigente
    Then la cuenta "CTA-201" actualiza su "fareCategory" a "UNIVERSITARIO"
    And el saldo de la cuenta "CTA-201" no es modificado
    And se emite el evento "CategoriaTarifariaActualizada"

  @TC-010 @US-02
  Scenario: Retorno exitoso a categoría GENERAL sin requerir documento
    When el agente "AGT-001" solicita cambiar la categoría de la cuenta "CTA-204" a "GENERAL" sin presentar documento adicional
    Then la cuenta "CTA-204" actualiza su "fareCategory" a "GENERAL"
    And se emite el evento "CategoriaTarifariaActualizada"

  @TC-011 @US-02
  Scenario: Rechazo de cambio a ESCOLAR con DNI inválido
    When el agente "AGT-001" solicita cambiar la categoría de la cuenta "CTA-201" a "ESCOLAR" presentando DNI "DOC-DNI-INVALIDO"
    Then la solicitud de cambio de categoría es rechazada por documento inválido
    And la cuenta "CTA-201" mantiene su "fareCategory" igual a "GENERAL"
    And se emite el evento "CambioCategoriaRechazadoPorDocumentoInvalido"

  @TC-012 @US-02
  Scenario: Rechazo de cambio a UNIVERSITARIO con carnet inválido
    When el agente "AGT-001" solicita cambiar la categoría de la cuenta "CTA-201" a "UNIVERSITARIO" presentando carnet universitario "DOC-CARNET-INVALIDO"
    Then la solicitud de cambio de categoría es rechazada por documento inválido
    And la cuenta "CTA-201" mantiene su "fareCategory" igual a "GENERAL"
    And se emite el evento "CambioCategoriaRechazadoPorDocumentoInvalido"

  @TC-013 @US-02
  Scenario: Rechazo de cambio de categoría en tarjeta con estado LOST_REPORTED
    When el agente "AGT-001" solicita cambiar la categoría de la cuenta "CTA-202" a "ESCOLAR" presentando DNI "DOC-DNI-2026" vigente
    Then la solicitud de cambio de categoría es rechazada porque la tarjeta está reportada como perdida
    And la cuenta "CTA-202" mantiene su "fareCategory" igual a "GENERAL"

  @TC-014 @US-02
  Scenario: Rechazo de cambio de categoría en tarjeta con estado BLOQUEADA_FRAUDE
    When el agente "AGT-001" solicita cambiar la categoría de la cuenta "CTA-203" a "ESCOLAR" presentando DNI "DOC-DNI-2026" vigente
    Then la solicitud de cambio de categoría es rechazada porque la tarjeta está bloqueada por fraude
    And la cuenta "CTA-203" mantiene su "fareCategory" igual a "GENERAL"
