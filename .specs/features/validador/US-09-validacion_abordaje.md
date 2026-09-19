# US-09: Validación de Abordaje Local en Validador Físico (ESP32)

## Descripción
**Como** validador embebido físico (ESP32) instalado en la unidad de bus,  
**Quiero** procesar la aproximación de una tarjeta NFC de transporte de forma completamente autónoma y offline,  
**Para** autorizar o rechazar el abordaje del pasajero en menos de 300 ms sin depender de conectividad a internet.

---

## Reglas de Negocio

1. **Autonomía Offline Estricta (Desacoplamiento):**
   - El validador **nunca** realiza consultas síncronas HTTP, gRPC o MQTT al backend en el momento del abordaje.
   - La validación se apoya exclusivamente en:
     - Los datos leídos de los sectores seguros de la tarjeta física NFC (ID serial `TRK-XXXX`, saldo en memoria, categoría tarifaria).
     - La Lista Negra local cargada en la memoria del ESP32 (Bloom Filter / tabla hash local).
2. **Verificación de Lista Negra Local:**
   - Si la tarjeta `TRK-XXXX` figura en la lista negra local del validador (por fraude, pérdida o deuda no recuperada), el abordaje se **rechaza** de inmediato con alarma sonora/visual de tarjeta bloqueada.
3. **Cálculo de Tarifa y Saldo Local:**
   - Se deduce la tarifa según la categoría grabada en la tarjeta:
     - `GENERAL`: Tarifa completa (ej. 2.50).
     - `ESTUDIANTE` / `ADULTO_MAYOR`: Tarifa preferencial (ej. 1.25).
4. **Margen de Crédito de Emergencia (Margen de Deuda):**
   - Si el saldo actual en el chip cubre la tarifa, se autoriza el abordaje y se decrementa el saldo en la tarjeta.
   - Si el saldo actual es menor a la tarifa, pero el saldo resultante no excede el margen máximo de deuda permitido (`MARGEN_DEUDA_MAXIMO = -5.00`), se autoriza el "viaje a crédito", dejando saldo negativo en el chip de la tarjeta.
   - Si el saldo resultante superaría el margen de deuda (`saldo - tarifa < -5.00`), el abordaje se **rechaza** por saldo insuficiente y límite de deuda alcanzado.
5. **Encolado de Evento de Viaje:**
   - Todo abordaje aprobado o rechazado genera un registro local de viaje con ID único (`VIA-XXX`), timestamp de hardware del validador, ID del bus (`BUS-XXX`), tarifa cobrada y saldo resultante.
   - El evento se almacena en la memoria flash interna del ESP32 en espera de conectividad para su posterior sincronización por lotes.

---

## Fuera de Alcance (Out of Scope)

- Conexión celular/Wi-Fi en el instante de la lectura NFC.
- Recarga de saldo a bordo del vehículo.

---

## Criterios de Aceptación

- [ ] Una tarjeta `TRK-9001` con saldo 10.00 aproxima al lector en `BUS-101`: abordaje autorizado, el saldo en el chip pasa a 7.50 y se genera registro de viaje local `VIA-901`.
- [ ] Una tarjeta `TRK-9002` con saldo 1.00 aproxima al lector en `BUS-101`: abordaje autorizado bajo margen de deuda, nuevo saldo en chip -1.50 (dentro del límite -5.00).
- [ ] Una tarjeta `TRK-9003` con saldo -3.50 aproxima al lector en `BUS-101`: con tarifa de 2.50 el saldo caería a -6.00 (excede margen -5.00), el validador rechaza el abordaje.
- [ ] Una tarjeta `TRK-9004` presente en el Bloom Filter local de lista negra: el validador rechaza el abordaje sin importar el saldo reportado en chip.
