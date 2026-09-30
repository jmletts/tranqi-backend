Feature: Verificación Criptográfica de Lotes de Viajes

  Scenario: Lote de viajes con firma criptográfica válida
    Given un validador de bus con clave publica registrada
    When envia un lote de viajes con una firma asimetrica valida
    Then el sistema verifica la firma exitosamente
    And procede a procesar los viajes del lote

  Scenario: Lote de viajes con firma criptográfica inválida (Ataque Spoofing)
    Given un validador de bus con clave publica registrada
    When un atacante envia un lote de viajes con una firma falsificada o invalida
    Then el sistema rechaza la peticion inmediatamente con 401
    And ningun viaje es guardado ni evaluado
