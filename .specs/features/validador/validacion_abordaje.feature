Feature: Validación local de abordaje en validador físico

  Como validador físico instalado en el bus
  Quiero procesar la aproximación de tarjetas NFC de forma offline
  Para autorizar o rechazar abordajes sin depender de conexión a internet en tiempo real

  Background:
    Given que el validador físico "BUS-101" opera en modo offline sin conexión al backend
    And la tarifa estándar para categoría "GENERAL" es de 1.20
    And la tarifa preferencial para categoría "ESCOLAR" es de 0.60
    And la tarifa preferencial para categoría "UNIVERSITARIO" es de 0.60
    And el margen máximo de deuda permitido en el sistema es de -3.00
    And la tarjeta "TRK-9004" se encuentra registrada en la lista negra local del validador

  Scenario: Abordaje exitoso con saldo suficiente para tarifa GENERAL
    Given que la tarjeta "TRK-9001" tiene categoría "GENERAL" y saldo en chip de 10.00
    When el pasajero aproxima la tarjeta "TRK-9001" al validador "BUS-101"
    Then el validador autoriza el abordaje
    And el saldo grabado en el chip de la tarjeta "TRK-9001" se actualiza a 8.80
    And el validador almacena localmente el viaje para su sincronización posterior

  Scenario: Abordaje exitoso con tarifa ESCOLAR
    Given que la tarjeta "TRK-9002" tiene categoría "ESCOLAR" y saldo en chip de 5.00
    When el pasajero aproxima la tarjeta "TRK-9002" al validador "BUS-101"
    Then el validador autoriza el abordaje descontando 0.60
    And el saldo grabado en el chip de la tarjeta "TRK-9002" se actualiza a 4.40

  Scenario: Abordaje exitoso con tarifa UNIVERSITARIO
    Given que la tarjeta "TRK-9005" tiene categoría "UNIVERSITARIO" y saldo en chip de 3.00
    When el pasajero aproxima la tarjeta "TRK-9005" al validador "BUS-101"
    Then el validador autoriza el abordaje descontando 0.60
    And el saldo grabado en el chip de la tarjeta "TRK-9005" se actualiza a 2.40

  Scenario: Abordaje a crédito permitido dentro del margen de deuda
    Given que la tarjeta "TRK-9003" tiene categoría "GENERAL" y saldo en chip de 0.50
    When el pasajero aproxima la tarjeta "TRK-9003" al validador "BUS-101"
    Then el validador autoriza el abordaje a crédito
    And el nuevo saldo grabado en el chip es de -0.70

  Scenario: Rechazo de abordaje cuando se excede el margen máximo de deuda
    Given que la tarjeta "TRK-9006" tiene categoría "GENERAL" y saldo en chip de -2.00
    When el pasajero aproxima la tarjeta "TRK-9006" al validador "BUS-101"
    Then el validador rechaza el abordaje por saldo insuficiente para cubrir la tarifa sin exceder el margen de deuda
    And el saldo en el chip se mantiene en -2.00
    And no se autoriza el paso en el torniquete

  Scenario: Rechazo inmediato de tarjeta presente en lista negra local
    Given que la tarjeta "TRK-9004" tiene saldo en chip de 25.00
    When el pasajero aproxima la tarjeta "TRK-9004" al validador "BUS-101"
    Then el validador rechaza el abordaje por estar en lista negra
    And el saldo en el chip no es modificado
