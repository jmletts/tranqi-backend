# Validador Inteligente de Transporte Público (ESP32 Firmware)
### Proyecto: Tranki Transit • Validador Físico Embebido

Este directorio contiene el firmware completo para el validador físico basado en el microcontrolador **ESP32**, el lector RFID **MFRC522** y la pantalla OLED **SSD1306** (128x64 I2C).

El firmware está estrictamente diseñado y estructurado para satisfacer las **14 Historias de Usuario (US-01 a US-14)** del sistema Tranki, operando bajo una arquitectura **Offline-First**, con validaciones en menos de **300 ms** y sincronización idempotente por lotes contra el backend central Spring Boot.

---

## 1. Diagrama de Conexiones (Pinout Físico)

> [!CAUTION]
> **ALERTA CRÍTICA DE VOLTAJE:** Tanto el módulo **MFRC522** como la pantalla **OLED SSD1306** deben alimentarse **únicamente con 3.3V**. Conectarlos al pin de 5V (VIN) quemará irremediablemente los circuitos integrados.

### A. Módulo RFID MFRC522 (Comunicación SPI)

| Pin MFRC522 | Pin ESP32 (GPIO) | Función / Cable |
|---|---|---|
| **3.3V** | **3.3V** | Alimentación lógica (¡NUNCA 5V!) |
| **GND** | **GND** | Tierra común |
| **RST** | **GPIO 4** | Reset del lector RFID |
| **SDA (SS / CS)** | **GPIO 5** | Slave Select (SPI) |
| **SCK** | **GPIO 18** | Reloj SPI (Clock) |
| **MISO** | **GPIO 19** | Master In Slave Out (SPI) |
| **MOSI** | **GPIO 23** | Master Out Slave In (SPI) |
| **IRQ** | *No conectado* | Queda libre |

### B. Pantalla OLED SSD1306 0.96" (Comunicación I2C)

| Pin OLED SSD1306 | Pin ESP32 (GPIO) | Función / Cable |
|---|---|---|
| **VCC** | **3.3V** | Alimentación lógica |
| **GND** | **GND** | Tierra común |
| **SCL** | **GPIO 22** | Reloj I2C (Clock) |
| **SDA** | **GPIO 21** | Datos I2C (Data) |

---

## 2. Mapa de Cumplimiento de las 14 Historias de Usuario

| US | Historia de Usuario | Implementación en el Firmware ESP32 |
|---|---|---|
| **US-01** | **Emitir Tarjeta** | Auto-emisión de tarjetas físicas con saldos iniciales reglamentarios: `GENERAL` (S/ 5.00), `SCHOOL` (S/ 2.50), `UNIVERSITY` (S/ 5.00). |
| **US-02** | **Cambiar Categoría Tarifaria** | Tarifa adaptativa: aplica S/ 1.20 a `GENERAL` y S/ 0.60 preferencial a `SCHOOL` / `UNIVERSITY`. Soporte para cambio dinámico mediante comando serie `CAT`. |
| **US-03** | **Configurar Tarjeta** | Lectura unívoca del UID del chip RFID por SPI y mapeo al identificador normalizado `TRK-XXXXXXXX`. |
| **US-04** | **Reportar Tarjeta Perdida** | Entrada en la Lista Negra local con motivo `LOST_STOLEN`. El validador bloquea de inmediato el abordaje. |
| **US-05** | **Bloquear Tarjeta por Fraude** | Entrada en la Lista Negra local con motivo `FRAUD`. Bloqueo definitivo inmediato en pantalla OLED. |
| **US-06** | **Confirmar Recarga** | Permite recargar saldo y levanta el bloqueo de deudas (`BLOCKED_DEBT` -> `ACTIVE`) procesando la orden `REMOVE` de la lista negra. |
| **US-07** | **Transferir Dinero** | Actualización consistente de fondos locales y comprobación de límites financieros. |
| **US-08** | **Consultar Movimientos** | Registro y auditoría en memoria flash de cada viaje (`tripId`, `cardId`, `fare`, `balance`, `timestamp`, `wasDebtTrip`). |
| **US-09** | **Validación de Abordaje Local** | **Núcleo Offline (< 300 ms):** Verificación contra lista negra en RAM, cobro según categoría, aplicación del **Margen de Deuda Máximo (-S/ 5.00)** y visualización completa en OLED. |
| **US-10** | **Procesar Lote de Viajes** | Cola persistente que empaqueta viajes acumulados en formato `TripBatchRequestDTO` y los despacha por HTTP POST a `/api/v1/trips/batch`. Tras recibir el ACK 200, purga la memoria de forma idempotente. |
| **US-11** | **Distribución de Lista Negra** | Tabla hash / lista en memoria con persistencia en NVS. Procesa altas y órdenes de remoción `REMOVE`. |
| **US-12** | **Gestión de Identidad IAM** | Credenciales de hardware y tokens de autorización embebidos para auditoría. |
| **US-13** | **Gestión de Flota** | Asociación a la unidad de transporte mediante `busId` (`BUS-201`), enlazado con la placa y clave pública. |
| **US-14** | **Verificación Criptográfica Zero-Trust** | Inclusión de `firma` (`VALID_SIGNATURE`) y `claveId` en cada lote, requerido por `VerifyValidatorSignatureUseCase` del backend. |

---

## 3. Guía de Instalación y Carga

### Opción 1: Con Arduino IDE

1. **Abrir el proyecto:**
   - Abre la carpeta `firmware/tranqi_validador_esp32/` y haz doble clic en `tranqi_validador_esp32.ino`.
2. **Instalar librerías desde el Gestor de Librerías (`Ctrl + Shift + I`):**
   - **Adafruit SSD1306** (por Adafruit)
   - **Adafruit GFX Library** (por Adafruit)
   - **MFRC522** (por GithubCommunity / Miguel Balboa)
   - **ArduinoJson** (por Benoit Blanchon, versión 6.x o 7.x)
3. **Seleccionar la placa:**
   - Menú: `Herramientas` -> `Placa` -> `ESP32 Arduino` -> `ESP32 Dev Module` (o `DOIT ESP32 DEVKIT V1`).
   - `Velocidad de subida`: 921600 (o 115200 si da error).
   - `Puerto`: Selecciona el puerto COM correspondiente a tu cable USB.
4. **Configuración de red en `config.h`:**
   - Ajusta `WIFI_SSID` y `WIFI_PASSWORD` con los datos de tu red.
   - Ajusta `BACKEND_BASE_URL` con la IP de tu PC donde corre el backend Tranki (ej. `http://192.168.1.50:8080`).
5. **Subir y Monitorear:**
   - Haz clic en **Subir** (`Ctrl + U`).
   - Abre el **Monitor Serie** (`Ctrl + Shift + M`) y configúralo a **115200 baudios**.

### Opción 2: Con PlatformIO (VS Code)

1. Abre la carpeta `firmware/` en VS Code con la extensión PlatformIO instalada.
2. PlatformIO descargará automáticamente todas las dependencias listadas en `platformio.ini`.
3. Conecta el ESP32 por USB y ejecuta:
   ```bash
   pio run --target upload
   pio device monitor
   ```

---

## 4. Consola Interactiva por Monitor Serie

Para facilitar las pruebas de laboratorio sin necesidad de contar con múltiples tarjetas físicas para cada caso de borde, el firmware incorpora una consola de comandos interactiva en tiempo real (a 115200 baudios):

```text
========== COMANDOS DISPONIBLES EN CONSOLA TRANQI ==========
 TAP <cardId>            : Simular aproximación de tarjeta (US-09)
                           Ej: TAP TRK-001       (Saldo 10.00 -> Cobra 1.20 -> Saldo 8.80)
                           Ej: TAP TRK-9002      (Saldo 1.00 -> Cobra 1.20 -> Saldo -0.20 CREDITO)
                           Ej: TAP TRK-9003      (Saldo -4.50 -> Tarifa 1.20 -> RECHAZADO < -5.00)
                           Ej: TAP TRK-9004      (En Lista Negra -> RECHAZADO BLOQUEADA)
 CAT <cardId> <CATEGORIA>: Cambiar categoría (US-02) (GENERAL, SCHOOL, UNIVERSITY)
 RECHARGE <cardId> <monto>: Recargar saldo a tarjeta (US-06)
 BLOCK <cardId> [MOTIVO] : Bloquear tarjeta en Lista Negra (US-04 / US-05)
 UNBLOCK <cardId>        : Retirar de Lista Negra (US-06 / US-11 REMOVE)
 SYNC                    : Forzar envío de lote de viajes al backend (US-10)
 STATUS                  : Ver estado de Wi-Fi, BusId y cola pendiente
 CARDS                   : Listar todas las tarjetas registradas
 BLACKLIST               : Listar tarjetas bloqueadas en Lista Negra
 LOGS                    : Listar viajes encolados pendientes de sync
============================================================
```

---

## 5. Pruebas Físicas con Llaveros / Tarjetas Blancas

Cuando acerques cualquier tarjeta o llavero RFID físico al sensor MFRC522:
1. El firmware leerá su UID físico (ejemplo: `A4B3C2D1`).
2. Lo convertirá al identificador de negocio: `TRK-A4B3C2D1`.
3. Si es la primera vez que se presenta, se auto-emitirá como categoría `GENERAL` con **S/ 5.00** de saldo de bienvenida (US-01).
4. La pantalla OLED mostrará inmediatamente:
   - `[ VIAJE AUTORIZADO ]`
   - `Cobro: -S/ 1.20`
   - `Nuevo Saldo: S/ 3.80`
5. El viaje quedará registrado en la cola offline y la pantalla mostrará `Q:1`.
6. Al cabo de unos segundos o al ejecutar `SYNC`, el ESP32 enviará el lote al backend Spring Boot y purgará la cola (`Q:0`).
