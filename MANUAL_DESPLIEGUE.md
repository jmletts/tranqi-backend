# 📖 Guía de Despliegue del Sistema Tranqi en Otra PC

Esta guía detalla los pasos para levantar la infraestructura completa del sistema (Base de Datos PostgreSQL, Broker MQTT, Backend Spring Boot y Frontend Web) en cualquier computadora, permitiendo que el validador físico ESP32 se comunique y sincronice de manera autónoma.

---

## 1. Requisitos Previos en la Nueva Computadora

1. **Docker Desktop**:
   - Descargar e instalar desde [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/).
   - Iniciar la aplicación y confirmar que el motor de Docker esté en verde (**Engine running**).
2. **Git** (opcional si se copia la carpeta del proyecto directamente por unidad USB o ZIP).
3. **Red Local Común**:
   - La nueva computadora y el ESP32 deben estar conectados a la **misma red Wi-Fi** o al mismo router para tener visibilidad IP mutua.

---

## 2. Obtener el Proyecto

Clonar el repositorio o descomprimir el código fuente, y abrir una terminal (PowerShell o CMD) en la raíz del proyecto:

```bash
cd tranqi-backend
```

---

## 3. Identificar la Dirección IP Local de la Nueva PC

El ESP32 necesita apuntar a la dirección IP de la computadora donde corre el servidor.

Abre PowerShell o Símbolo del sistema y ejecuta:

```powershell
ipconfig
```

Busca tu adaptador de red activo (**Wi-Fi** o **Ethernet**) y anota la **Dirección IPv4**.  
*Ejemplo:* `192.168.1.15` (en adelante referida como `<IP_DE_TU_PC>`).

---

## 4. Habilitar Puertos en el Firewall de Windows (Solo una vez)

Windows bloquea por defecto las conexiones entrantes de dispositivos externos en la red local.

Para permitir que el ESP32 envíe lotes HTTP y mensajes MQTT sin ser rechazado:

1. Presiona `Win + X` y selecciona **Terminal (Administrador)** o **PowerShell (Administrador)**.
2. Ejecuta los siguientes dos comandos:

```powershell
New-NetFirewallRule -DisplayName "Tranki Backend 8080" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow
New-NetFirewallRule -DisplayName "Mosquitto MQTT 1883" -Direction Inbound -Protocol TCP -LocalPort 1883 -Action Allow
```

---

## 5. Levantar los Servidores con Docker Compose

Desde la raíz de la carpeta `tranqi-backend`, ejecuta:

```bash
docker compose up -d --build
```

Docker construirá las imágenes y levantará automáticamente los 4 servicios en contenedores independientes:

| Servicio | Contenedor | Puerto | Descripción |
| :--- | :--- | :--- | :--- |
| **PostgreSQL** | `tranki-postgres` | `5432` | Base de datos relacional (cuentas, tarjetas, flota, historial) |
| **Mosquitto MQTT** | `tranki-mqtt` | `1883` | Broker de mensajería para alertas urgentes y telemetría |
| **Spring Boot** | `tranki-backend` | `8080` | API REST para validación de lotes y lista negra |
| **Expo Web** | `tranki-frontend` | `8081` | Dashboard administrativo y de usuario |

### Verificar que todos los contenedores estén activos:
```bash
docker compose ps
```
Todos deben figurar en estado `Up` o `healthy`.

---

## 6. Verificación en el Navegador Web

Abre tu navegador en la nueva PC para validar la disponibilidad:

1. **Prueba de Backend y Lista Negra:**  
   Ingresa a: `http://localhost:8080/api/v1/blacklist/sync?localVersion=0`  
   *Debe responder un JSON con la versión actual (ej. `{"newVersion":0,...}`).*
2. **Dashboard Frontend:**  
   Ingresa a: `http://localhost:8081`  
   *Cargará la aplicación web de Tranqi.*

---

## 7. Configuración y Carga del Firmware en el ESP32

Abre el proyecto del firmware en **Arduino IDE** o **PlatformIO** (VS Code):

### A. Si usas el firmware principal (`firmware/tranqi_validador_esp32/`):
Abre el archivo `firmware/tranqi_validador_esp32/config.h` y actualiza:

```c
// IP de la nueva PC obtenida en el Paso 3
#define BACKEND_BASE_URL      "http://<IP_DE_TU_PC>:8080"
#define MQTT_BROKER_HOST      "<IP_DE_TU_PC>"
#define MQTT_BROKER_PORT      1883

// Credenciales de la red Wi-Fi
#define WIFI_SSID             "NOMBRE_DE_TU_WIFI"
#define WIFI_PASSWORD         "PASSWORD_DE_TU_WIFI"
```

### B. Si usas el firmware legacy (`firmware/legacy/firmware_legacy.ino`):
Actualiza las líneas de configuración en la parte superior:

```c
const char* ssid = "NOMBRE_DE_TU_WIFI";
const char* password = "PASSWORD_DE_TU_WIFI";
const char* backendUrl = "http://<IP_DE_TU_PC>:8080/api/v1/trips/batch";
```

### Conexión de Pines del ESP32:
- **Pantalla OLED SSD1306 (I2C):** SDA -> Pin 21 | SCL -> Pin 22 | VCC -> 3.3V | GND -> GND
- **Lector RFID RC522 (SPI):** 3.3V -> 3.3V | GND -> GND | RST -> Pin 4 | MISO -> Pin 19 | MOSI -> Pin 23 | SCK -> Pin 18 | SDA/SS -> Pin 5
- **Buzzer:** Pata larga (+) -> Pin 15 | Pata corta (-) -> GND

Carga el código en el ESP32 y abre el Monitor Serial a **115200 baudios** para observar las validaciones en tiempo real y la sincronización automática.

---

## 8. Comandos Útiles de Administración

- **Detener los servidores:**
  ```bash
  docker compose down
  ```
- **Iniciar nuevamente sin recompilar:**
  ```bash
  docker compose up -d
  ```
- **Ver logs del backend:**
  ```bash
  docker compose logs -f backend
  ```
- **Ver logs del broker MQTT:**
  ```bash
  docker compose logs -f mqtt
  ```
- **Reiniciar un servicio específico (ejemplo backend):**
  ```bash
  docker compose restart backend
  ```
