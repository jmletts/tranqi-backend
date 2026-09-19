Feature: Validación local de abordaje en validador físico

  Como validador físico instalado en el bus
  Quiero procesar la aproximación de tarjetas NFC de forma offline
  Para autorizar o rechazar abordajes sin depender de conexión a internet

  Background:
    Given que el validador físico "BUS-101" opera en modo offline sin conexión al backend
    And la tarifa estándar para categoría "GENERAL" es de 2.50
    And la tarifa preferencial para categoría "ESTUDIANTE" es de 1.25
    And el margen máximo de deuda permitido en el sistema es de -5.00
    And la tarjeta "TRK-9004" se encuentra registrada en la lista negra local del validador

  Scenario: Abordaje exitoso con saldo suficiente para tarifa general
    Given que la tarjeta "TRK-9001" tiene categoría "GENERAL" y saldo en chip de 10.00
    When el pasajero aproxima la tarjeta "TRK-9001" al validador "BUS-101"
    Then el validador autoriza el abordaje
    And el saldo grabado en el chip de la tarjeta "TRK-9001" se actualiza a 7.50
    And el validador almacena localmente el viaje "VIA-901" para su sincronización posterior

  Scenario: Abordaje exitoso con tarifa de estudiante
    Given que la tarjeta "TRK-9002" tiene categoría "ESTUDIANTE" y saldo en chip de 5.00
    When el pasajero aproxima la tarjeta "TRK-9002" al validador "BUS-101"
    Then el validador autoriza el abordaje descontando 1.25
    And el saldo grabado en el chip de la tarjeta "TRK-9002" se actualiza a 3.75

  Scenario: Abordaje a crédito permitido dentro del margen de deuda
    Given que la tarjeta "TRK-9003" tiene categoría "GENERAL" y saldo en chip de 1.00
    When el pasajero aproxima la tarjeta "TRK-9003" al validador "BUS-101"
    Then el validador autoriza el abordaje a crédito
    And el nuevo saldo grabado en el chip es de -1.50

  Scenario: Rechazo de abordaje cuando se excede el margen máximo de deuda
    Given que la tarjeta "TRK-9005" tiene categoría "GENERAL" y saldo en chip de -3.50
    When el pasajero aproxima la tarjeta "TRK-9005" al validador "BUS-101"
    Then el validador rechaza el abordaje por saldo insuficiente
    And el saldo en el chip se mantiene en -3.50
    And no se autoriza el paso en el torniquete

  Scenario: Rechazo inmediato de tarjeta presente en lista negra local
    Given que la tarjeta "TRK-9004" tiene saldo en chip de 25.00
    When el pasajero aproxima la tarjeta "TRK-9004" al validador "BUS-101"
    Then el validador rechaza el abordaje por estar en lista negra
    And el saldo en el chip no es modificado
