Feature: Gestión de Flota Operativa

  Scenario: Registro de un nuevo bus por un Gestor de Flota
    Given un usuario autenticado con el rol "GESTOR_FLOTA"
    When registra un bus con placa "ABC-123", hardwareId "MAC-01" y una clave publica
    Then el bus es registrado exitosamente en el sistema

  Scenario: Consulta de ganancias por bus
    Given un bus con placa "ABC-123" que ha procesado 3 viajes de "1.20"
    And un usuario autenticado con rol "GESTOR_FLOTA"
    When consulta las ganancias del bus "ABC-123"
    Then el sistema reporta una ganancia total de "3.60"
