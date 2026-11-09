Feature: Verificación Criptográfica Zero-Trust Bidireccional

  # Flujo 1: ESP32 -> Backend (Viajes)
  @TC-077 @US-14
  Scenario: Lote de viajes con firma criptográfica válida
    Given un validador de bus con clave publica registrada
    When envia un lote de viajes con una firma asimetrica valida
    Then el sistema verifica la firma exitosamente
    And procede a procesar los viajes del lote

  @TC-078 @US-14
  Scenario: Lote de viajes con firma criptográfica inválida (Ataque Spoofing)
    Given un validador de bus con clave publica registrada
    When un atacante envia un lote de viajes con una firma falsificada o invalida
    Then el sistema rechaza la peticion inmediatamente con 401
    And ningun viaje es guardado ni evaluado

  # Flujo 2: Backend -> ESP32 (Lista Negra)
  @TC-079 @US-14
  Scenario: Generación de firma criptográfica para actualización de la lista negra
    Given una actualizacion de la lista negra con tarjetas bloqueadas
    When el sistema prepara el payload de la lista negra para su distribucion a los validadores
    Then el sistema genera una firma ECDSA utilizando la llave privada del servidor
    And adjunta la firma al payload saliente para que el validador pueda verificar su autenticidad
