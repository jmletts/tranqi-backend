Feature: Emisión inicial de tarjeta de transporte

  Como agente de kiosco del sistema de recaudo
  Quiero emitir una tarjeta física validando la categoría tarifaria y el documento correspondiente
  Para que un pasajero pueda comenzar a utilizar el sistema con la tarifa correcta desde el primer viaje

  Background:
    Given que el agente de kiosco "AGT-001" opera en el punto de recarga "PRC-001"
    And la tarjeta "TRK-1001" existe en el sistema con estado "EN_INVENTARIO"
    And la tarjeta "TRK-1002" existe en el sistema con estado "EN_INVENTARIO"
    And la tarjeta "TRK-1003" existe en el sistema con estado "EN_INVENTARIO"
    And la tarjeta "TRK-1004" existe en el sistema con estado "EN_INVENTARIO"
    And la tarjeta "TRK-9001" existe en el sistema con estado "ACTIVE" asociada a la cuenta "CTA-901"

  Scenario: Emisión exitosa de tarjeta con categoría GENERAL de forma anónima
    When el agente "AGT-001" solicita emitir la tarjeta "TRK-1001" con categoría "GENERAL" sin documento adicional
    Then la tarjeta "TRK-1001" pasa al estado "ACTIVE"
    And se crea una nueva cuenta con "userId" nulo asociada a la tarjeta "TRK-1001"
    And el saldo inicial de la cuenta creada es de 5.00
    And el campo "kioskAgentId" de la tarjeta "TRK-1001" queda registrado como "AGT-001"
    And la tarjeta "TRK-1001" recibe un "verificationNumber" de 12 dígitos generado con SecureRandom
    And se emite el evento "TarjetaEmitida"

  Scenario: Emisión exitosa de tarjeta con categoría ESCOLAR con DNI válido
    When el agente "AGT-001" solicita emitir la tarjeta "TRK-1002" con categoría "ESCOLAR" presentando DNI "DOC-DNI-2026" vigente
    Then la tarjeta "TRK-1002" pasa al estado "ACTIVE"
    And la cuenta creada tiene "fareCategory" igual a "ESCOLAR"
    And el saldo inicial de la cuenta creada es de 2.50
    And el campo "userId" de la cuenta creada es nulo
    And se emite el evento "TarjetaEmitida"

  Scenario: Emisión exitosa de tarjeta con categoría UNIVERSITARIO con carnet válido
    When el agente "AGT-001" solicita emitir la tarjeta "TRK-1003" con categoría "UNIVERSITARIO" presentando carnet universitario "DOC-CARNET-2026" vigente
    Then la tarjeta "TRK-1003" pasa al estado "ACTIVE"
    And la cuenta creada tiene "fareCategory" igual a "UNIVERSITARIO"
    And el saldo inicial de la cuenta creada es de 5.00
    And el campo "userId" de la cuenta creada es nulo
    And se emite el evento "TarjetaEmitida"

  Scenario: Rechazo de emisión de tarjeta ESCOLAR con DNI inválido o vencido
    When el agente "AGT-001" solicita emitir la tarjeta "TRK-1001" con categoría "ESCOLAR" presentando DNI "DOC-DNI-VENCIDO" expirado
    Then la solicitud de emisión es rechazada por documento inválido
    And la tarjeta "TRK-1001" permanece en estado "EN_INVENTARIO"
    And no se crea ninguna cuenta en el sistema
    And se emite el evento "EmisionRechazadaPorDocumentoInvalido"

  Scenario: Rechazo de emisión de tarjeta UNIVERSITARIO con carnet inválido
    When el agente "AGT-001" solicita emitir la tarjeta "TRK-1002" con categoría "UNIVERSITARIO" presentando carnet universitario "DOC-CARNET-INVALIDO"
    Then la solicitud de emisión es rechazada por documento inválido
    And la tarjeta "TRK-1002" permanece en estado "EN_INVENTARIO"
    And no se crea ninguna cuenta en el sistema
    And se emite el evento "EmisionRechazadaPorDocumentoInvalido"

  Scenario: Rechazo al intentar emitir una tarjeta que ya está activa
    When el agente "AGT-001" solicita emitir la tarjeta "TRK-9001" con categoría "GENERAL" sin documento adicional
    Then la solicitud de emisión es rechazada porque la tarjeta ya se encuentra activa
    And la tarjeta "TRK-9001" mantiene su cuenta "CTA-901" sin modificaciones

  Scenario: El "verificationNumber" generado es único globalmente en el sistema
    Given que el sistema ya contiene una tarjeta con "verificationNumber" "123456789012"
    When el agente "AGT-001" solicita emitir la tarjeta "TRK-1004" con categoría "GENERAL"
    Then el sistema genera un nuevo "verificationNumber" distinto de "123456789012" para la tarjeta "TRK-1004"
    And la tarjeta "TRK-1004" pasa al estado "ACTIVE"
    And se emite el evento "TarjetaEmitida"
