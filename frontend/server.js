/**
 * ============================================================================
 * TRANQI TRANSIT - SERVIDOR FRONTEND & IOT BRIDGE (PORT 3000)
 * ============================================================================
 */

const express = require('express');
const path = require('path');
const http = require('http');
const mqtt = require('mqtt');

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Proxy inverso transparente para el Backend Spring Boot (:8080)
// Permite que http://localhost:3000/api/... se comunique directo sin CORS
app.use('/api', (req, res) => {
  const targetUrl = new URL(req.originalUrl, BACKEND_URL);
  
  const proxyReq = http.request(targetUrl, {
    method: req.method,
    headers: {
      ...req.headers,
      host: targetUrl.host
    }
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    res.status(502).json({ error: 'Backend unreachable', details: err.message });
  });

  req.pipe(proxyReq);
});

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname)));

// Fallback para SPA
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ----------------------------------------------------------------------------
// SERVICIO DE TELEMETRÍA IOT Y PUENTE MQTT (VAL: BUS-201)
// ----------------------------------------------------------------------------
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
let mqttBridgeClient = null;

try {
  mqttBridgeClient = mqtt.connect(MQTT_BROKER, {
    clientId: 'tranqi_iot_bridge_srv',
    reconnectPeriod: 3000
  });

  mqttBridgeClient.on('connect', () => {
    console.log('[IOT-BRIDGE] Conectado al broker MQTT Mosquitto en ' + MQTT_BROKER);
    
    // Suscribirse a comandos para el validador
    mqttBridgeClient.subscribe('/flota/validadores/BUS-201/command');
    mqttBridgeClient.subscribe('/flota/validadores/commands');

    // Emitir Heartbeat periódico del validador BUS-201
    publishValidatorHeartbeat();
    setInterval(publishValidatorHeartbeat, 5000);
  });

  mqttBridgeClient.on('message', (topic, message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log(`[IOT-BRIDGE] Comando recibido en ${topic}:`, data);
      
      // Si se recibe un TAP o comando remoto, confirmar telemetría inmediata
      if (data.action === 'TAP' || data.cmd === 'TAP') {
        publishValidatorHeartbeat();
      }
    } catch (e) {}
  });

  mqttBridgeClient.on('error', (err) => {
    console.warn('[IOT-BRIDGE] MQTT error:', err.message);
  });
} catch (e) {
  console.warn('[IOT-BRIDGE] No se pudo inicializar bridge:', e.message);
}

let heartbeatSeq = 0;
function publishValidatorHeartbeat() {
  if (!mqttBridgeClient || !mqttBridgeClient.connected) return;
  heartbeatSeq++;

  const payload = {
    busId: 'BUS-201',
    validatorKeyId: 'VALIDADOR-ESP32-BUS-01-v1',
    wifi: true,
    rssi: -58,
    ip: '192.168.1.100',
    pendingTrips: 0,
    blVersion: 1,
    blCount: 2,
    cardsCount: 6,
    uptimeSec: heartbeatSeq * 5,
    freeHeap: 182410,
    status: 'OPERATIONAL'
  };

  mqttBridgeClient.publish('/flota/validadores/BUS-201/status', JSON.stringify(payload), { qos: 0 });
}

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================================================`);
  console.log(`  TRANQI TRANSIT • DASHBOARD FRONTEND & IOT BRIDGE ACTIVO`);
  console.log(`  URL Local:   http://localhost:${PORT}/`);
  console.log(`  Broker MQTT: ws://localhost:9001`);
  console.log(`  Backend API: http://localhost:8080 (Proxy en /api)`);
  console.log(`=================================================================`);
});
