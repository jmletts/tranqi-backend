Feature: Publicación y distribución de actualizaciones de lista negra

  Como sistema backend central
  Quiero distribuir las actualizaciones de tarjetas bloqueadas a los validadores físicos
  Para mantener sincronizada la lista local de bloqueo mediante deltas, carga completa o eventos inmediatos

  Background:
    Given que la versión global actual de la lista negra en el backend es 105
    And las siguientes tarjetas se encuentran en la lista negra del backend:
      | tarjetaId | motivo           | estado          | versionAgregada |
      | TRK-9001  | DEUDA_PENDIENTE  | BLOCKED_DEUDA   | 101             |
      | TRK-9002  | FRAUDE_CLONACION | BLOCKED_FRAUDE  | 103             |
      | TRK-9003  | EXTRAVIO_REPORT  | BLOCKED_PERDIDA | 105             |

  Scenario: Distribución mediante delta incremental para un validador desfasado
    Given que el validador físico "BUS-301" reporta tener la versión local 102
    When el validador "BUS-301" solicita actualización de lista negra
    Then el backend retorna un delta con las versiones 103 a 105
    And el delta contiene la adición de la tarjeta "TRK-9002"
    And el delta contiene la adición de la tarjeta "TRK-9003"
    And la nueva versión reportada al validador "BUS-301" es 105

  Scenario: Distribución mediante carga completa para un validador nuevo
    Given que el validador físico "BUS-302" se conecta por primera vez con versión local 0
    When el validador "BUS-302" solicita sincronización inicial
    Then el backend entrega una carga completa con las 3 tarjetas bloqueadas
    And el validador "BUS-302" actualiza su versión local a 105

  Scenario: Validador sincronizado no recibe cambios
    Given que el validador físico "BUS-303" reporta tener la versión local 105
    When el validador "BUS-303" solicita actualización de lista negra
    Then el backend responde que no existen cambios pendientes
    And la lista de modificaciones en el delta está vacía

  Scenario: Emisión de evento inmediato ante bloqueo por fraude
    When se ejecuta un bloqueo por fraude sobre la tarjeta "TRK-9004"
    Then el backend incrementa la versión global de la lista negra a 106
    And se publica de inmediato un evento push prioritario con la adición de "TRK-9004" para toda la flota

  Scenario: Delta incremental que contiene remoción por recarga que saldó deuda
    Given que la tarjeta "TRK-9001" saldó su deuda y pasó a estado "ACTIVE" en la versión 106
    When el validador "BUS-301" con versión local 105 solicita actualización de lista negra
    Then el delta incluye una instrucción de tipo "REMOVE" para la tarjeta "TRK-9001"
    And la versión del validador "BUS-301" se actualiza a 106
