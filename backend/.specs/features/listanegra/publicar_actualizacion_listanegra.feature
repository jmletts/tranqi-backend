Feature: Publicación y distribución de actualizaciones de lista negra

  Como sistema backend central
  Quiero distribuir las actualizaciones de tarjetas bloqueadas a los validadores físicos
  Para mantener sincronizada la lista local de bloqueo mediante deltas incrementales, carga completa o eventos inmediatos — los tres mecanismos son complementarios y ninguno reemplaza a los otros

  Background:
    Given que la versión global actual de la lista negra en el backend es 105
    And las siguientes tarjetas se encuentran en la lista negra del backend:
      | tarjetaId | motivo       | versionAgregada |
      | TRK-9001  | DEUDA        | 101             |
      | TRK-9002  | FRAUDE       | 103             |
      | TRK-9003  | PERDIDA_ROBO | 105             |

  Scenario: Distribución mediante delta incremental para un validador desfasado
    Given que el validador físico "BUS-301" reporta tener la versión local 102
    When el validador "BUS-301" solicita actualización de lista negra
    Then el backend retorna un delta con las entradas de las versiones 103 a 105
    And el delta contiene la adición de la tarjeta "TRK-9002" con motivo "FRAUDE"
    And el delta contiene la adición de la tarjeta "TRK-9003" con motivo "PERDIDA_ROBO"
    And la nueva versión reportada al validador "BUS-301" es 105
    And se emite el evento "DeltaListaNegraPublicado"

  Scenario: Distribución mediante carga completa para un validador que se conecta por primera vez
    Given que el validador físico "BUS-302" se conecta por primera vez con versión local 0
    When el validador "BUS-302" solicita sincronización inicial
    Then el backend entrega una carga completa con las 3 tarjetas bloqueadas
    And el validador "BUS-302" actualiza su versión local a 105

  Scenario: Un delta fuera de secuencia se descarta y se solicita sincronización completa
    Given que el validador físico "BUS-303" reporta tener la versión local 50
    When el validador "BUS-303" solicita actualización de lista negra
    Then el backend descarta el delta por desfase excesivo
    And el backend solicita una sincronización completa en lugar del delta parcial
    And se emite el evento "SincronizacionCompletaSolicitadaPorDesfase"

  Scenario: Validador ya sincronizado no recibe cambios
    Given que el validador físico "BUS-304" reporta tener la versión local 105
    When el validador "BUS-304" solicita actualización de lista negra
    Then el backend responde que no existen cambios pendientes
    And la lista de modificaciones en el delta está vacía

  Scenario: Emisión de evento inmediato ante bloqueo por fraude
    When se ejecuta un bloqueo por fraude sobre la tarjeta "TRK-9004"
    Then el backend incrementa la versión global de la lista negra a 106
    And se publica de inmediato un evento push prioritario vía MQTT con la adición de "TRK-9004" para toda la flota
    And se emite el evento "EventoInmediatoPublicado"
    And el evento inmediato actúa como mecanismo complementario al delta, no como su único canal de entrega

  Scenario: Solicitud rechazada por exceso de peticiones (429 Too Many Requests)
    Given que una dirección IP solicita actualización de lista negra más veces de las permitidas por segundo
    When el backend procesa la solicitud de sincronización
    Then el backend rechaza la petición con código HTTP 429 Too Many Requests
    And el servicio permanece estable sin sobrecargar la base de datos

  Scenario: Delta incremental que contiene remoción por recarga que saldó deuda
    Given que la tarjeta "TRK-9001" saldó su deuda y fue removida de la lista negra en la versión 106
    When el validador "BUS-301" con versión local 105 solicita actualización de lista negra
    Then el delta incluye una instrucción de tipo "REMOVE" para la tarjeta "TRK-9001"
    And la versión del validador "BUS-301" se actualiza a 106
    And se emite el evento "DeltaListaNegraPublicado"

  Scenario: Política de purga — entrada DEUDA nunca se purga automáticamente por tiempo
    Given que han transcurrido 180 días desde que la tarjeta "TRK-9001" fue añadida a la lista negra con motivo "DEUDA"
    When el sistema ejecuta la tarea periódica de evaluación de purga
    Then la tarjeta "TRK-9001" permanece en la lista negra porque una entrada de motivo "DEUDA" nunca se purga sola
    And la entrada solo se retira al acreditarse el pago de la deuda correspondiente

  Scenario: Política de purga — entrada PERDIDA_ROBO se purga automáticamente a los 90 días
    Given que la tarjeta "TRK-9003" fue añadida a la lista negra con motivo "PERDIDA_ROBO" hace exactamente 90 días
    When el sistema ejecuta la tarea periódica de evaluación de purga
    Then la tarjeta "TRK-9003" es removida automáticamente de la lista negra por antigüedad
    And se emite el evento "EntradaListaNegraPurgadaPorAntiguedad"

  Scenario: Política de purga — entrada FRAUDE nunca se purga automáticamente
    Given que han transcurrido 365 días desde que la tarjeta "TRK-9002" fue añadida a la lista negra con motivo "FRAUDE"
    When el sistema ejecuta la tarea periódica de evaluación de purga
    Then la tarjeta "TRK-9002" permanece en la lista negra porque una entrada de motivo "FRAUDE" nunca se purga automáticamente
    And su remoción requiere revisión administrativa explícita
