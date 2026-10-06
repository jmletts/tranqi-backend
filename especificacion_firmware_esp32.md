# Especificación de Sincronización de Lista Negra - (Backend a ESP32)

Hola equipo de Firmware / ESP32. Desde el lado del backend ya tenemos estructurada y desarrollada la arquitectura para la distribución de la Lista Negra (Tarjetas bloqueadas). 

Este documento detalla cómo deben comunicarse los buses con el servidor y una consulta técnica importante sobre la estructura de datos en memoria para poder alinear el código Java con el código C/C++.

---

## 1. Mecanismos de Sincronización

El ESP32 recibirá actualizaciones de la lista negra mediante dos vías complementarias:

### A. Sincronización periódica (HTTP Polling)
El ESP32 debe hacer una petición `GET` periódica (ej. cada 60 segundos) cuando esté conectado a internet (WiFi o 4G). 

**Endpoint:** `GET /api/v1/blacklist/sync?localVersion={tu_version_local}`

*   **Si el ESP32 es nuevo o su memoria se borró (`localVersion=0`):** El backend responderá con una **Carga Completa (Full Snapshot)** enviando un archivo **BINARIO**. Este archivo es el filtro matemático pre-calculado para que el ESP32 lo cargue directo a RAM sin parsear textos pesados.
*   **Si el ESP32 solo necesita actualizarse (`localVersion=102`):** El backend responderá con un **Delta Incremental en JSON** para que sea ligero.

**Ejemplo de respuesta JSON (Delta):**
```json
{
  "newVersion": 105,
  "isFullSnapshot": false,
  "changes": {
    "add": ["TRK-9002", "TRK-9003"],
    "remove": ["TRK-9001"]
  }
}
```
*(El ESP32 debe leer el delta, aplicar los "add" y "remove" en su memoria local, y guardar la versión `105` como su nueva `localVersion`).*

> **Nota de Seguridad:** Este endpoint HTTP es público, pero cuenta con protección anti-ataques (Rate Limiting). No hagan más de 60 peticiones por minuto por bus o el backend responderá con error `429 Too Many Requests`.

### B. Eventos Urgentes (MQTT Push)
Para bloqueos críticos por Fraude o Robo que ocurran mientras el bus está en ruta validando, el backend no esperará al Polling. Disparará un evento MQTT.
*   **Tópico a suscribirse:** `/flota/listanegra/urgente`
*   **Comportamiento esperado:** Al recibir el JSON por MQTT, extraer el ID de la tarjeta, bloquearlo inmediatamente en la memoria RAM y actualizar la versión.

---

## 2. Consulta Técnica: Estructura del Filtro Binario (Cuckoo vs Bloom)

Para la descarga del archivo **Binario (Carga Completa)**, habíamos pensado usar un **Cuckoo Filter** porque soporta la operación de "borrar" (vital para cuando un usuario paga su deuda y su tarjeta sale de la lista negra).

Sin embargo, el backend en Java tiene que compilar los bytes **exactamente** en el mismo formato que la librería de C/C++ del ESP32 los va a leer.

Para poder programar el generador binario en el servidor, necesitamos alinear lo siguiente:

1.  **Librería C/C++:** ¿Qué librería van a usar en el firmware del ESP32 para leer/procesar el Cuckoo Filter? (Si tienen enlace de GitHub, mejor).
2.  **Algoritmo de Hashing:** ¿Usarán `MurmurHash3`, `CityHash` o `xxHash` para generar los fingerprints?
3.  **Tamaño del Fingerprint:** ¿De cuántos bits será la huella dactilar de cada tarjeta? (ej. 8 bits, 12 bits, 16 bits).
4.  **Tamaño de los Buckets:** Capacidad de ranuras por bucket.

### ¿Plan B?
Si el desarrollo del Cuckoo Filter en C/C++ resulta ser muy complejo para parsear los bytes binarios crudos, la alternativa más estándar de la industria es usar un **Bloom Filter** tradicional (que no permite borrados). Si optamos por Bloom Filter, la lógica de los "borrados" simplemente requerirá que el ESP32 descargue el binario completo de nuevo cuando haya una remoción, o mantenga una "lista blanca" (JSON local) en el bus para compensar.

Por favor, revísenlo y avísennos qué estructura binaria les resulta más cómoda procesar a nivel de hardware.
