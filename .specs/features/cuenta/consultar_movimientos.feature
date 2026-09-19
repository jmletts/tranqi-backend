Feature: Consulta de movimientos de tarjeta

  Como usuario registrado
  Quiero consultar el historial de viajes y recargas de mis tarjetas
  Para llevar control de mis gastos de transporte de forma transparente

  Background:
    Given que el usuario "USR-401" existe en el sistema
    And el usuario "USR-402" existe en el sistema
    And la tarjeta "TRK-8001" con cuenta "CTA-801" está vinculada a "USR-401"
    And la tarjeta "TRK-8002" con cuenta "CTA-802" está vinculada a "USR-402"
    And la tarjeta "TRK-8003" con cuenta "CTA-803" es anónima y está en estado "ACTIVE"
    And la tarjeta "TRK-8001" registra los siguientes movimientos históricos:
      | tipo       | identificador | monto | fecha               | detalle  |
      | RECARGA    | TRX-801       | 20.00 | 2026-09-10 08:00:00 | KIOSCO   |
      | VIAJE      | VIA-801       | -2.50 | 2026-09-10 09:15:00 | BUS-101  |
      | VIAJE      | VIA-802       | -2.50 | 2026-09-10 18:30:00 | BUS-102  |

  Scenario: Consulta exitosa del historial de movimientos de una tarjeta propia
    When el usuario "USR-401" consulta los movimientos de su tarjeta "TRK-8001"
    Then el sistema retorna un listado con 3 movimientos
    And el primer movimiento de la lista corresponde al viaje "VIA-802"
    And la respuesta incluye el saldo actual de la cuenta "CTA-801"

  Scenario: Rechazo al consultar movimientos de una tarjeta perteneciente a otro usuario
    When el usuario "USR-401" intenta consultar los movimientos de la tarjeta "TRK-8002"
    Then el sistema rechaza la consulta por no ser titular de la tarjeta

  Scenario: Rechazo al consultar movimientos de una tarjeta anónima desde perfil de usuario
    When el usuario "USR-401" intenta consultar los movimientos de la tarjeta anónima "TRK-8003"
    Then el sistema deniega el acceso indicando que la tarjeta es anónima
