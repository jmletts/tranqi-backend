Feature: Sincronización idempotente de lote de viajes

  Como sistema backend central
  Quiero procesar lotes de viajes transmitidos por los validadores físicos
  Para conciliar los saldos de las cuentas y registrar el historial de manera idempotente

  Background:
    Given la tarjeta "TRK-1001" existe con cuenta "CTA-101" y saldo de 3.00 en estado "ACTIVE"
    And la tarjeta "TRK-1002" existe con cuenta "CTA-102" y saldo de 0.50 en estado "ACTIVE"
    And el validador físico "BUS-201" tiene conexión restablecida con el backend

  Scenario: Procesamiento exitoso de un lote con múltiples viajes válidos
    When el validador "BUS-201" envía un lote con los siguientes viajes:
      | tripId   | cardId   | fare | localTimestamp      |
      | VIA-1001 | TRK-1001 | 1.20 | 2026-09-15 10:00:00 |
      | VIA-1002 | TRK-1001 | 1.20 | 2026-09-15 14:00:00 |
    Then el lote es aceptado con 2 viajes procesados exitosamente
    And el saldo final de la cuenta "CTA-101" es de 0.60
    And se emite el evento "ViajeProcesadoConExito" por cada viaje aceptado

  Scenario: Detección idempotente de viajes previamente sincronizados
    Given el viaje "VIA-1001" ya fue registrado previamente para la tarjeta "TRK-1001"
    When el validador "BUS-201" reenvía el lote conteniendo el viaje "VIA-1001"
    Then el backend reconoce el viaje "VIA-1001" como duplicado
    And el saldo de la cuenta "CTA-101" no es debitado nuevamente
    And se emite el evento "ViajeDescartadoPorDuplicado"

  Scenario: Viaje conciliado que lleva la cuenta a saldo negativo pasa la tarjeta a bloqueo por deuda
    When el validador "BUS-201" envía un lote con el viaje:
      | tripId   | cardId   | fare | localTimestamp      |
      | VIA-1003 | TRK-1002 | 1.20 | 2026-09-15 16:30:00 |
    Then el viaje "VIA-1003" es procesado exitosamente
    And el saldo de la cuenta "CTA-102" pasa a ser de -0.70
    And la tarjeta "TRK-1002" pasa al estado "BLOCKED_DEBT"
    And la tarjeta "TRK-1002" es programada para ingresar a la lista negra

  Scenario: El exceso de deuda no revierte el viaje — se marca para revisión
    Given la tarjeta "TRK-1002" tiene un saldo de -2.80 y "debtMarginLimit" de -3.00
    When el validador "BUS-201" envía un lote con el viaje:
      | tripId   | cardId   | fare | localTimestamp      |
      | VIA-1004 | TRK-1002 | 1.20 | 2026-09-15 17:00:00 |
    Then el viaje "VIA-1004" es procesado y registrado en el sistema
    And el saldo de la cuenta "CTA-102" queda por debajo del "debtMarginLimit"
    And el viaje "VIA-1004" queda con "processingStatus" igual a "PROCESADO" pero marcado para revisión de exceso de deuda
    And se emite el evento "ViajeGeneroExcesoDeDeudaRequiereRevision"

  Scenario: Rechazo de viaje con "localTimestamp" en el futuro
    When el validador "BUS-201" envía un lote con el viaje:
      | tripId   | cardId   | fare | localTimestamp      |
      | VIA-1005 | TRK-1001 | 1.20 | 2099-01-01 00:00:00 |
    Then el viaje "VIA-1005" es rechazado porque su "localTimestamp" es una fecha futura
    And el saldo final de la cuenta "CTA-101" es de 3.00

  Scenario: Tolerancia a viajes con tarjetas inexistentes dentro del lote
    When el validador "BUS-201" envía un lote con los siguientes viajes:
      | tripId   | cardId   | fare | localTimestamp      |
      | VIA-1006 | TRK-1001 | 1.20 | 2026-09-15 18:00:00 |
      | VIA-1007 | TRK-9999 | 1.20 | 2026-09-15 18:05:00 |
    Then el viaje "VIA-1006" es aceptado y debitado de la cuenta "CTA-101"
    And el viaje "VIA-1007" es registrado como error por tarjeta no encontrada
    And el reporte del lote indica 1 viaje exitoso y 1 viaje con error
