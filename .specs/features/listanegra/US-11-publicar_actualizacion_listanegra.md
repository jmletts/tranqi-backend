# US-11: Publicación y Distribución de Actualizaciones de Lista Negra

## Descripción
**Como** sistema backend central de Tranki,  
**Quiero** distribuir las actualizaciones de tarjetas bloqueadas a la flota de validadores físicos mediante deltas, cargas completas o eventos inmediatos,  
**Para** asegurar que los dispositivos locales rechacen de manera oportuna el abordaje de tarjetas fraudulentas, perdidas o morosas.

---

## Reglas de Negocio

1. **Estrategias de Distribución:**
   - **Delta Incremental:** Cuando un validador (`BUS-XXX`) solicita sincronización indicando su número de versión actual (`versionLocal`), el backend calcula y entrega únicamente los cambios ocurridos desde dicha versión (tarjetas añadidas o removidas por desbloqueo).
   - **Carga Completa (Full Snapshot):** Si el validador es nuevo, reporta versión `0` o está demasiado desfasado respecto a la versión actual del sistema, el backend entrega el estado consolidado completo de todas las tarjetas bloqueadas (o el Bloom Filter serializado correspondiente).
   - **Evento Inmediato (Push Urgente):** Ante bloqueos de máxima prioridad (estado `BLOCKED_FRAUDE` o `BLOCKED_PERDIDA`), el backend emite un mensaje broadcast prioritario (ej. tópico MQTT `/flota/listanegra/urgente`) para que los buses con conectividad celular en ruta actualicen su memoria al instante.
2. **Control de Versiones Monótono:** Cada alteración en la lista negra incrementa un número de versión secuencial y monótono (`versionListaNegra`).
3. **Manejo de Desbloqueos (Remociones):** Cuando una tarjeta en `BLOCKED_DEUDA` es recargada y pasa a `ACTIVE`, el delta debe incluir la acción explícita `REMOVE` para que el validador la elimine de su lista de bloqueo.
4. **Idempotencia de Aplicación en Validador:** Los cambios aplicados por el validador deben ser idempotentes ante reenvíos de deltas.

---

## Fuera de Alcance (Out of Scope)

- Implementación del algoritmo criptográfico del firmware del ESP32.
- Protocolo físico de red inalámbrica del patio de maniobras.

---

## Criterios de Aceptación

- [ ] Un validador `BUS-301` con versión local 100 solicita sincronización; el backend entrega un delta con 2 bloqueos nuevos ocurridos entre versión 101 y 102.
- [ ] Un validador nuevo `BUS-302` con versión local 0 solicita sincronización; el backend entrega la carga completa con las tarjetas bloqueadas del sistema y la versión global actual.
- [ ] Al producirse un bloqueo por fraude sobre `TRK-5001`, el sistema emite inmediatamente un evento push prioritario con la acción de bloqueo.
- [ ] Cuando una tarjeta salda su deuda, el delta incluye la instrucción de remoción `REMOVE` para rehabilitarla en los validadores.
- [ ] Si un validador ya posee la última versión, el backend retorna una respuesta indicando sin cambios (delta vacío).
