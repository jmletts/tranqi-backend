Feature: Consulta del historial de movimientos de una cuenta

  Como usuario registrado en la aplicación
  Quiero consultar el historial de viajes y recargas de una cuenta que administro
  Para llevar control transparente de mis gastos de transporte y saldos disponibles

  Background:
    Given que el usuario "USR-401" existe en el sistema
    And el usuario "USR-402" existe en el sistema
    And la tarjeta "TRK-8001" existe con estado "ACTIVE", asociada a la cuenta "CTA-801" con "userId" igual a "USR-401"
    And la tarjeta "TRK-8002" existe con estado "ACTIVE", asociada a la cuenta "CTA-802" con "userId" igual a "USR-402"
    And la tarjeta "TRK-8003" existe con estado "ACTIVE", asociada a la cuenta "CTA-803" con "userId" nulo
    And la cuenta "CTA-801" registra los siguientes movimientos históricos en orden cronológico descendente:
      | tipo    | identificador | monto  | fecha               | detalle |
      | RECARGA | TRX-801       | 20.00  | 2026-09-10 08:00:00 | KIOSCO  |
      | VIAJE   | VIA-801       | -1.20  | 2026-09-10 09:15:00 | BUS-101 |
      | VIAJE   | VIA-802       | -1.20  | 2026-09-10 18:30:00 | BUS-102 |

  Scenario: Consulta exitosa del historial de movimientos de una cuenta propia
    When el usuario "USR-401" consulta los movimientos de la cuenta "CTA-801"
    Then el sistema retorna un listado con 3 movimientos
    And el primer movimiento del listado corresponde al viaje "VIA-802" por ser el más reciente
    And la respuesta incluye el saldo actual de la cuenta "CTA-801"

  Scenario: Rechazo al consultar movimientos de una cuenta perteneciente a otro usuario
    When el usuario "USR-401" intenta consultar los movimientos de la cuenta "CTA-802"
    Then el sistema rechaza la consulta porque el "userId" de la cuenta no coincide con el del usuario solicitante

  Scenario: Rechazo al consultar movimientos de una cuenta anónima no vinculada al usuario
    When el usuario "USR-401" intenta consultar los movimientos de la cuenta anónima "CTA-803"
    Then el sistema rechaza la consulta porque la cuenta es anónima y no está vinculada a ningún usuario
