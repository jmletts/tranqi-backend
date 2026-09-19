Feature: Emisión inicial de tarjeta de transporte

  Como operador de taquilla o kiosco
  Quiero emitir una tarjeta física registrando la categoría tarifaria
  Para que un pasajero comience a utilizar el sistema de transporte

  Background:
    Given que la tarjeta "TRK-1001" existe en el sistema con estado "EN_INVENTARIO"
    And la tarjeta "TRK-1002" existe en el sistema con estado "EN_INVENTARIO"
    And la tarjeta "TRK-1003" existe en el sistema con estado "EN_INVENTARIO"
    And la tarjeta "TRK-9001" existe en el sistema con estado "ACTIVE" asociada a la cuenta "CTA-901"

  Scenario: Emisión exitosa de tarjeta con tarifa general de forma anónima
    When se solicita la emisión de la tarjeta "TRK-1001" con categoría "GENERAL"
    Then la tarjeta "TRK-1001" pasa al estado "ACTIVE"
    And la tarjeta "TRK-1001" tiene asignada una cuenta con prefijo "CTA-"
    And la tarjeta "TRK-1001" no tiene ningún usuario vinculado
    And la cuenta creada tiene un saldo inicial de 0.00

  Scenario: Emisión exitosa de tarjeta con categoría estudiante con documento válido
    When se solicita la emisión de la tarjeta "TRK-1002" con categoría "ESTUDIANTE" y documento universitario "DOC-EST-2026" vigente
    Then la tarjeta "TRK-1002" pasa al estado "ACTIVE"
    And la tarjeta "TRK-1002" tiene la categoría tarifaria "ESTUDIANTE"
    And la tarjeta "TRK-1002" no tiene ningún usuario vinculado

  Scenario: Rechazo de emisión de tarjeta estudiante con documento vencido o no válido
    When se solicita la emisión de la tarjeta "TRK-1003" con categoría "ESTUDIANTE" y documento universitario "DOC-VENCIDO" expirado
    Then la solicitud de emisión es rechazada por documento inválido
    And la tarjeta "TRK-1003" permanece en estado "EN_INVENTARIO"
    And no se crea ninguna cuenta en el sistema

  Scenario: Rechazo de emisión de tarjeta adulto mayor para persona menor de 65 años
    When se solicita la emisión de la tarjeta "TRK-1003" con categoría "ADULTO_MAYOR" y documento de identidad con edad 45 años
    Then la solicitud de emisión es rechazada por no cumplir la edad mínima
    And la tarjeta "TRK-1003" permanece en estado "EN_INVENTARIO"

  Scenario: Rechazo al intentar emitir una tarjeta que ya fue emitida y está activa
    When se solicita la emisión de la tarjeta "TRK-9001" con categoría "GENERAL"
    Then la solicitud de emisión es rechazada porque la tarjeta ya se encuentra activa
    And la tarjeta "TRK-9001" mantiene su cuenta "CTA-901" sin modificaciones
