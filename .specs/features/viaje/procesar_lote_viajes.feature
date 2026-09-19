Feature: Sincronización idempotente de lote de viajes

  Como sistema backend central
  Quiero procesar lotes de viajes transmitidos por los validadores físicos
  Para conciliar los saldos de las cuentas y registrar el historial de manera idempotente

  Background:
    Given que la tarjeta "TRK-1001" existe con cuenta "CTA-101" y saldo de 15.00 en estado "ACTIVE"
    And la tarjeta "TRK-1002" existe con cuenta "CTA-102" y saldo de 1.00 en estado "ACTIVE"
    And el validador físico "BUS-201" tiene conexión restablecida con el backend

  Scenario: Procesamiento exitoso de un lote con múltiples viajes válidos
    When el validador "BUS-201" envía un lote con los siguientes viajes:
      | identificadorViaje | tarjetaId | tarifa | fechaHora           |
      | VIA-1001           | TRK-1001  | 2.50   | 2026-09-15 10:00:00 |
      | VIA-1002           | TRK-1001  | 2.50   | 2026-09-15 14:00:00 |
    Then el lote es aceptado con 2 viajes procesados exitosamente
    And el saldo final de la cuenta "CTA-101" es de 10.00

  Scenario: Detección idempotente de viajes previamente sincronizados
    Given que el viaje "VIA-1001" ya fue registrado previamente para la tarjeta "TRK-1001"
    When el validador "BUS-201" reenvía el lote conteniendo el viaje "VIA-1001"
    Then el backend reconoce el viaje "VIA-1001" como duplicado
    And el saldo de la cuenta "CTA-101" no es debitado nuevamente

  Scenario: Viaje conciliado que genera saldo negativo pasa la tarjeta a bloqueo por deuda
    When el validador "BUS-201" envía un lote con el viaje:
      | identificadorViaje | tarjetaId | tarifa | fechaHora           |
      | VIA-1003           | TRK-1002  | 2.50   | 2026-09-15 16:30:00 |
    Then el viaje "VIA-1003" es procesado exitosamente
    And el saldo de la cuenta "CTA-102" pasa a ser de -1.50
    And la tarjeta "TRK-1002" pasa al estado "BLOCKED_DEUDA"
    And la tarjeta "TRK-1002" es programada para ingresar a la lista negra

  Scenario: Tolerancia a viajes con tarjetas inexistentes dentro del lote
    When el validador "BUS-201" envía un lote con los siguientes viajes:
      | identificadorViaje | tarjetaId | tarifa | fechaHora           |
      | VIA-1004           | TRK-1001  | 2.50   | 2026-09-15 18:00:00 |
      | VIA-1005           | TRK-9999  | 2.50   | 2026-09-15 18:05:00 |
    Then el viaje "VIA-1004" es aceptado y debitado de la cuenta "CTA-101"
    And el viaje "VIA-1005" es registrado como error por tarjeta no encontrada
    And el reporte del lote indica 1 viaje exitoso y 1 viaje con error
