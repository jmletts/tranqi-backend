Feature: Confirmación de recarga de saldo en cuenta

  Como sistema de recaudo por kiosco o pasarela de notificaciones de backend
  Quiero confirmar la acreditación de saldo en una cuenta
  Para incrementar el balance disponible y levantar bloqueos por deuda de forma automática

  # Nota de alcance: todos los escenarios de este archivo corresponden a recargas de origen KIOSCO
  # (presencial, efectivo, via AgenteKiosko) o PASARELA_NOTIFICACION (webhook de backend).
  # Las recargas iniciadas desde la aplicación móvil del usuario final están fuera del alcance de esta entrega.

  Background:
    Given que la tarjeta "TRK-6001" existe con estado "ACTIVE", asociada a la cuenta "CTA-601" con saldo 5.00
    And la tarjeta "TRK-6002" existe con estado "ACTIVE", asociada a la cuenta "CTA-602" con saldo -4.00
    And la tarjeta "TRK-6003" existe con estado "ACTIVE", asociada a la cuenta "CTA-603" con saldo -15.00
    And la tarjeta "TRK-6004" existe con estado "BLOQUEADA_FRAUDE", asociada a la cuenta "CTA-604" con saldo 0.00
    And la tarjeta "TRK-6005" existe con estado "LOST_REPORTED", asociada a la cuenta "CTA-605" con saldo 0.00

  Scenario: Recarga exitosa desde kiosco físico para tarjeta activa
    When se procesa una recarga con identificador "TRX-601" por un monto de 15.00 en la tarjeta "TRK-6001" con origen "KIOSCO"
    Then la recarga es acreditada exitosamente
    And el saldo de la cuenta "CTA-601" es de 20.00
    And la tarjeta "TRK-6001" permanece en estado "ACTIVE"
    And se emite el evento "RecargaConfirmada"

  Scenario: Recarga exitosa que levanta automáticamente el bloqueo por deuda
    When se procesa una recarga con identificador "TRX-602" por un monto de 10.00 en la tarjeta "TRK-6002" con origen "KIOSCO"
    Then la recarga es acreditada exitosamente
    And el saldo de la cuenta "CTA-602" pasa a ser de 6.00
    And la tarjeta "TRK-6002" cambia de estado a "ACTIVE"
    And se genera una orden de remoción de lista negra para la tarjeta "TRK-6002"
    And se emite el evento "CuentaDesbloqueadaPorRecarga"

  Scenario: Recarga insuficiente que no cubre la deuda total mantiene el bloqueo
    When se procesa una recarga con identificador "TRX-603" por un monto de 5.00 en la tarjeta "TRK-6003" con origen "PASARELA_NOTIFICACION"
    Then la recarga es acreditada exitosamente
    And el saldo de la cuenta "CTA-603" pasa a ser de -10.00
    And la tarjeta "TRK-6003" permanece en estado "ACTIVE"
    And se emite el evento "RecargaConfirmada"

  Scenario: Procesamiento idempotente ante reenvío de la misma recarga
    Given que la recarga "TRX-601" ya fue procesada anteriormente con un saldo acreditado de 15.00 en la cuenta "CTA-601"
    When se vuelve a recibir la recarga con identificador "TRX-601" por un monto de 15.00 en la tarjeta "TRK-6001"
    Then el sistema responde confirmando la transacción previa
    And el saldo de la cuenta "CTA-601" no se incrementa por segunda vez

  Scenario: Rechazo de recarga en tarjeta con bloqueo por fraude
    When se procesa una recarga con identificador "TRX-604" por un monto de 20.00 en la tarjeta "TRK-6004" con origen "KIOSCO"
    Then la solicitud de recarga es rechazada por tarjeta bloqueada por fraude
    And el saldo de la cuenta "CTA-604" permanece en 0.00

  Scenario: Rechazo de recarga en tarjeta reportada como perdida
    When se procesa una recarga con identificador "TRX-605" por un monto de 10.00 en la tarjeta "TRK-6005" con origen "KIOSCO"
    Then la solicitud de recarga es rechazada por tarjeta reportada como perdida

  Scenario: Rechazo de recarga en cuenta inexistente
    When se procesa una recarga con identificador "TRX-699" por un monto de 10.00 en la tarjeta "TRK-9999" con origen "KIOSCO"
    Then la solicitud de recarga es rechazada por cuenta inexistente
    And se emite el evento "RecargaRechazadaPorCuentaInexistente"
