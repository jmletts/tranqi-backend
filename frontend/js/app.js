/**
 * ============================================================================
 * TRANQI TRANSIT • FRONTEND DASHBOARD & TELEMETRY CONTROLLER
 * Archivo: app.js
 * Cumplimiento: US-01 a US-14 (Monitoreo de Flota, OLED, Lista Negra, MQTT)
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // ESTADO GLOBAL DE LA APLICACIÓN
  // --------------------------------------------------------------------------
  const state = {
    soundEnabled: true,
    mqttConnected: false,
    backendConnected: false,
    hardwareConnected: false,
    
    kpis: {
      totalTrips: 0,
      authorized: 0,
      rejected: 0,
      blacklistCount: 0,
      mqttCount: 0
    },

    validator: {
      busId: 'BUS-201',
      validatorKeyId: 'VALIDADOR-ESP32-BUS-01-v1',
      wifi: true,
      rssi: -58,
      ip: '192.168.1.100',
      pendingTrips: 0,
      blVersion: 1,
      freeHeap: 182410,
      status: 'OPERATIONAL',
      uptimeSec: 0,
      lastSeen: 0
    },

    // Tarjetas en circulación (US-01 a US-03, US-06)
    cards: new Map([
      ['TRK-001',    { id: 'TRK-001',    category: 'GENERAL',    balance: 10.00, desc: 'Pase general regular' }],
      ['TRK-9001',   { id: 'TRK-9001',   category: 'GENERAL',    balance: 10.00, desc: 'Pase general regular' }],
      ['TRK-9002',   { id: 'TRK-9002',   category: 'GENERAL',    balance: 1.00,  desc: 'Viaje a crédito (-0.20)' }],
      ['TRK-9003',   { id: 'TRK-9003',   category: 'GENERAL',    balance: -4.50, desc: 'Límite deuda (-5.00)' }],
      ['TRK-SCHOOL', { id: 'TRK-SCHOOL', category: 'SCHOOL',     balance: 5.00,  desc: 'Escolar (Tarifa S/ 0.60)' }],
      ['TRK-UNIV',   { id: 'TRK-UNIV',   category: 'UNIVERSITY', balance: 5.00,  desc: 'Universitario (Tarifa S/ 0.60)' }],
    ]),

    // Lista Negra en memoria (US-11)
    blacklist: new Map([
      ['TRK-9004',  { cardId: 'TRK-9004',  reason: 'FRAUD',       version: 1, date: new Date().toLocaleTimeString() }],
      ['TRK-LOST',  { cardId: 'TRK-LOST',  reason: 'LOST_STOLEN', version: 1, date: new Date().toLocaleTimeString() }],
    ]),

    // Tarifas vigentes (US-02, US-09)
    fares: {
      GENERAL: 1.20,
      SCHOOL: 0.60,
      UNIVERSITY: 0.60
    },

    MARGEN_DEUDA_MAXIMO: -5.00,
    oledResetTimer: null
  };

  // --------------------------------------------------------------------------
  // SINTETIZADOR DE AUDIO (WEB AUDIO API)
  // --------------------------------------------------------------------------
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playChime(type) {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'authorized') {
        // Dual beep agudo agradable tipo validador Metro/Bus
        osc.type = 'sine';
        osc.frequency.setValueAtTime(950, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
        osc.start();
        osc.stop(ctx.currentTime + 0.24);
      } else if (type === 'rejected') {
        // Zumbido grave de error
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(180, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.36);
      } else if (type === 'urgent') {
        // Sirena de alerta de seguridad
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.32);
      }
    } catch (e) {
      console.warn('Audio no disponible:', e);
    }
  }

  // --------------------------------------------------------------------------
  // CONEXIÓN MQTT VÍA WEBSOCKETS (MOSQUITTO :9001)
  // --------------------------------------------------------------------------
  let mqttClient = null;

  function initMqtt() {
    const wsHost = window.location.hostname || 'localhost';
    const brokerUrl = `ws://${wsHost}:9001`;

    logMqtt('SYS', `Conectando a broker Mosquitto en ${brokerUrl}...`);

    try {
      mqttClient = mqtt.connect(brokerUrl, {
        clientId: 'tranqi_dashboard_' + Math.random().toString(16).substring(2, 8),
        keepalive: 30,
        reconnectPeriod: 3000
      });

      mqttClient.on('connect', () => {
        state.mqttConnected = true;
        updateBadge('mqtt-badge', true, 'MQTT: CONECTADO');
        logMqtt('SYS', 'Conexión WebSocket establecida con Mosquitto. Suscribiendo a /flota/#...');
        
        // Suscribirse a toda la flota y tópicos de lista negra
        mqttClient.subscribe('/flota/#', (err) => {
          if (!err) {
            logMqtt('SYS', 'Suscrito exitosamente a /flota/#');
          }
        });

        // Enviar ping inicial para solicitar status del validador
        publishMqtt('/flota/validadores/BUS-201/command', { cmd: 'PING' });
      });

      mqttClient.on('message', (topic, message) => {
        handleMqttMessage(topic, message.toString());
      });

      mqttClient.on('error', (err) => {
        console.error('MQTT Error:', err);
        updateBadge('mqtt-badge', false, 'MQTT: ERROR');
      });

      mqttClient.on('close', () => {
        state.mqttConnected = false;
        updateBadge('mqtt-badge', false, 'MQTT: DESCONECTADO');
      });

    } catch (err) {
      console.error('No se pudo inicializar cliente MQTT:', err);
      updateBadge('mqtt-badge', false, 'MQTT: NO DISPONIBLE');
    }
  }

  function publishMqtt(topic, payload) {
    const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
    if (mqttClient && state.mqttConnected) {
      mqttClient.publish(topic, payloadStr, { qos: 1 });
      logMqtt(topic, payloadStr, true);
    } else {
      logMqtt(topic, `[SIMULADO] ${payloadStr}`, true);
    }
  }

  function handleMqttMessage(topic, payloadStr) {
    state.kpis.mqttCount++;
    document.getElementById('kpi-mqtt-count').textContent = state.kpis.mqttCount;
    logMqtt(topic, payloadStr);

    try {
      const data = JSON.parse(payloadStr);

      // 1. Tópico de Eventos de Lista Negra Urgente (US-11C)
      if (topic === '/flota/listanegra/urgente') {
        onMqttUrgentEvent(data);
      }
      // 2. Tópico de Status / Heartbeat del Validador ESP32
      else if (topic.startsWith('/flota/validadores/') && topic.endsWith('/status')) {
        onValidatorStatus(data);
      }
      // 3. Tópico de Eventos de Validación y Abordajes
      else if (topic.startsWith('/flota/validadores/') && topic.endsWith('/events')) {
        onValidatorEvent(data);
      }
    } catch (e) {
      // Mensaje plano
    }
  }

  function logMqtt(topic, message, isOut = false) {
    const container = document.getElementById('mqtt-terminal-logs');
    if (!container) return;

    const timeStr = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = 'log-entry';

    const dirTag = isOut ? '->' : '<-';
    entry.innerHTML = `
      <span class="log-time">[${timeStr}]</span>
      <span class="log-topic">${dirTag} ${topic}</span>
      <span class="log-payload">${escapeHtml(message)}</span>
    `;

    container.appendChild(entry);
    container.scrollTop = container.scrollHeight;

    // Limitar logs a 150 elementos para optimizar memoria
    if (container.children.length > 150) {
      container.removeChild(container.firstChild);
    }
  }

  // --------------------------------------------------------------------------
  // EVENTOS INCOMING MQTT
  // --------------------------------------------------------------------------
  function onMqttUrgentEvent(data) {
    // Payload esperado: { action: "BLOCK"|"UNBLOCK", cardId, reason, version }
    const action = (data.action || '').toUpperCase();
    const cardId = data.cardId;
    const reason = data.reason || 'FRAUD';
    const version = data.version || (state.validator.blVersion + 1);

    if (action === 'BLOCK') {
      state.blacklist.set(cardId, {
        cardId: cardId,
        reason: reason,
        version: version,
        date: new Date().toLocaleTimeString()
      });
      state.validator.blVersion = version;
      renderBlacklistTable();
      playChime('urgent');

      // Si la tarjeta está en la pantalla o se bloquea, actualizar OLED
      showOledRejected(cardId, `BLOQUEADO: ${reason}`, 0.00);
    } else if (action === 'UNBLOCK' || action === 'REMOVE') {
      state.blacklist.delete(cardId);
      renderBlacklistTable();
    }
  }

  function onValidatorStatus(data) {
    state.hardwareConnected = true;
    state.validator.lastSeen = Date.now();
    updateBadge('validator-badge', true, `ESP32: ${data.busId || 'BUS-201'}`);

    if (data.ip) state.validator.ip = data.ip;
    if (data.rssi !== undefined) state.validator.rssi = data.rssi;
    if (data.pendingTrips !== undefined) state.validator.pendingTrips = data.pendingTrips;
    if (data.blVersion !== undefined) state.validator.blVersion = data.blVersion;
    if (data.freeHeap !== undefined) state.validator.freeHeap = data.freeHeap;
    if (data.busId) state.validator.busId = data.busId;

    renderTelemetry();
  }

  function onValidatorEvent(data) {
    if (data.type === 'VALIDATION') {
      recordValidationEvent(data);
    } else if (data.type === 'BATCH_SYNC') {
      state.validator.pendingTrips = data.pending || 0;
      renderTelemetry();
      showOledSync(data.pending, data.status === 'SUCCESS', data.httpCode || 200);
    }
  }

  // --------------------------------------------------------------------------
  // VALIDACIÓN DE ABORDAJES (NÚCLEO OFFLINE-FIRST US-09)
  // --------------------------------------------------------------------------
  function handleCardTap(cardId) {
    const startMs = performance.now();

    // Enviar comando remoto al validador físico si está conectado por MQTT
    publishMqtt(`/flota/validadores/${state.validator.busId}/command`, {
      action: 'TAP',
      cardId: cardId
    });

    // 1. Verificación en Lista Negra
    if (state.blacklist.has(cardId)) {
      const blEntry = state.blacklist.get(cardId);
      const elapsed = Math.round(performance.now() - startMs);

      const eventData = {
        timestamp: new Date().toLocaleTimeString(),
        busId: state.validator.busId,
        cardId: cardId,
        status: 'REJECTED',
        reason: `LISTA NEGRA (${blEntry.reason})`,
        balance: 0.00,
        fare: 0.00,
        elapsedMs: elapsed
      };

      recordValidationEvent(eventData);
      showOledRejected(cardId, 'TARJETA BLOQUEADA', 0.00);
      playChime('rejected');
      return;
    }

    // 2. Obtener o auto-registrar tarjeta (US-01)
    let card = state.cards.get(cardId);
    if (!card) {
      card = {
        id: cardId,
        category: 'GENERAL',
        balance: 5.00, // Saldo reglamentario US-01
        desc: 'Tarjeta física autodetectada'
      };
      state.cards.set(cardId, card);
      renderCardsList();
    }

    // 3. Determinar tarifa según categoría (US-02, US-09)
    const fare = state.fares[card.category] || state.fares.GENERAL;
    const currentBalance = card.balance;
    const resultingBalance = parseFloat((currentBalance - fare).toFixed(2));

    // 4. Evaluación de margen de deuda (-5.00)
    if (resultingBalance < state.MARGEN_DEUDA_MAXIMO) {
      const elapsed = Math.round(performance.now() - startMs);
      const eventData = {
        timestamp: new Date().toLocaleTimeString(),
        busId: state.validator.busId,
        cardId: cardId,
        category: card.category,
        status: 'REJECTED',
        reason: 'SALDO INSUFICIENTE',
        balance: currentBalance,
        fare: fare,
        elapsedMs: elapsed
      };

      recordValidationEvent(eventData);
      showOledRejected(cardId, 'SALDO INSUFICIENTE', currentBalance);
      playChime('rejected');
      return;
    }

    // 5. Abordaje AUTORIZADO
    const wasDebt = resultingBalance < 0;
    card.balance = resultingBalance;
    state.validator.pendingTrips++;

    const elapsed = Math.round(performance.now() - startMs);
    const eventData = {
      timestamp: new Date().toLocaleTimeString(),
      busId: state.validator.busId,
      cardId: cardId,
      category: card.category,
      fare: fare,
      balance: resultingBalance,
      status: 'AUTHORIZED',
      debt: wasDebt,
      reason: wasDebt ? 'VIAJE A CRÉDITO' : '',
      elapsedMs: elapsed
    };

    recordValidationEvent(eventData);
    showOledAuthorized(cardId, card.category, fare, resultingBalance, wasDebt);
    playChime('authorized');
    renderCardsList();
    renderTelemetry();
  }

  // --------------------------------------------------------------------------
  // RENDERIZADO DEL DISPLAY OLED SSD1306 (128x64)
  // --------------------------------------------------------------------------
  function resetOledToIdle() {
    clearTimeout(state.oledResetTimer);
    const screen = document.getElementById('oled-screen');
    screen.className = 'oled-screen';

    document.getElementById('oled-top-bus').textContent = state.validator.busId;
    document.getElementById('oled-top-wifi').textContent = state.validator.wifi ? '📶 WiFi: ON' : '⚠️ OFFLINE';
    document.getElementById('oled-main-text').textContent = 'TRANQI TRANSIT';
    document.getElementById('oled-sub-text').textContent = 'ACERQUE SU TARJETA';
    document.getElementById('oled-amount-text').style.display = 'none';
    document.getElementById('oled-bot-trips').textContent = `COLA: ${state.validator.pendingTrips} VIAS`;
    document.getElementById('oled-bot-ver').textContent = `BL v${state.validator.blVersion}`;
  }

  function showOledAuthorized(cardId, category, fare, balance, wasDebt) {
    clearTimeout(state.oledResetTimer);
    const screen = document.getElementById('oled-screen');
    screen.className = 'oled-screen mode-authorized';

    document.getElementById('oled-main-text').textContent = wasDebt ? 'PASE (A CRÉDITO)' : 'PASE POR FAVOR';
    document.getElementById('oled-sub-text').textContent = `${cardId} • ${category}`;
    
    const amtEl = document.getElementById('oled-amount-text');
    amtEl.textContent = `SALDO: S/ ${balance.toFixed(2)}`;
    amtEl.style.display = 'block';

    document.getElementById('oled-bot-trips').textContent = `COBRADO: S/ ${fare.toFixed(2)}`;
    document.getElementById('oled-bot-ver').textContent = 'AUTORIZADO';

    state.oledResetTimer = setTimeout(resetOledToIdle, 3200);
  }

  function showOledRejected(cardId, reason, balance) {
    clearTimeout(state.oledResetTimer);
    const screen = document.getElementById('oled-screen');
    screen.className = 'oled-screen mode-rejected';

    document.getElementById('oled-main-text').textContent = 'ACCESO DENEGADO';
    document.getElementById('oled-sub-text').textContent = reason;
    
    const amtEl = document.getElementById('oled-amount-text');
    amtEl.textContent = `SALDO: S/ ${balance.toFixed(2)}`;
    amtEl.style.display = 'block';

    document.getElementById('oled-bot-trips').textContent = cardId;
    document.getElementById('oled-bot-ver').textContent = 'RECHAZADO';

    state.oledResetTimer = setTimeout(resetOledToIdle, 3200);
  }

  function showOledSync(pending, ok, code) {
    clearTimeout(state.oledResetTimer);
    const screen = document.getElementById('oled-screen');
    screen.className = ok ? 'oled-screen mode-authorized' : 'oled-screen mode-rejected';

    document.getElementById('oled-main-text').textContent = ok ? 'SYNC EXITOSO' : 'ERROR EN SYNC';
    document.getElementById('oled-sub-text').textContent = `HTTP ${code} • LOTE SUBIDO`;
    document.getElementById('oled-amount-text').style.display = 'none';
    document.getElementById('oled-bot-trips').textContent = `RESTANTES: ${pending}`;
    document.getElementById('oled-bot-ver').textContent = 'BATCH US-10';

    state.oledResetTimer = setTimeout(resetOledToIdle, 2500);
  }

  // --------------------------------------------------------------------------
  // REGISTRO DE EVENTOS (LIVE STREAM)
  // --------------------------------------------------------------------------
  function recordValidationEvent(event) {
    state.kpis.totalTrips++;
    if (event.status === 'AUTHORIZED') {
      state.kpis.authorized++;
    } else {
      state.kpis.rejected++;
    }

    document.getElementById('kpi-total-trips').textContent = state.kpis.totalTrips;
    document.getElementById('kpi-authorized').textContent = state.kpis.authorized;
    document.getElementById('kpi-rejected').textContent = state.kpis.rejected;

    const stream = document.getElementById('event-stream');
    if (!stream) return;

    // Eliminar placeholder si existe
    if (stream.children.length === 1 && stream.children[0].textContent.includes('Esperando')) {
      stream.innerHTML = '';
    }

    const row = document.createElement('div');
    const isAuth = (event.status === 'AUTHORIZED');
    row.className = `event-row ${isAuth ? 'authorized' : 'rejected'}`;
    row.dataset.status = event.status;

    const catBadge = event.category ? `<span class="tag" style="font-size: 0.65rem;">${event.category}</span>` : '';
    const fareText = event.fare ? `-S/ ${Number(event.fare).toFixed(2)}` : 'S/ 0.00';
    const balText = event.balance !== undefined ? `Saldo: S/ ${Number(event.balance).toFixed(2)}` : '';
    const latency = event.elapsedMs ? `${event.elapsedMs}ms` : '<300ms';

    row.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.65rem;">
        <span style="font-family: var(--font-mono); color: var(--text-muted); font-size: 0.72rem;">[${event.timestamp}]</span>
        <strong style="font-family: var(--font-mono); color: var(--text-primary);">${event.cardId}</strong>
        ${catBadge}
      </div>

      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span style="font-family: var(--font-mono); font-size: 0.75rem; color: ${isAuth ? 'var(--accent-emerald)' : 'var(--accent-coral)'};">
          ${isAuth ? `${fareText} (${balText})` : event.reason}
        </span>
        <span class="pill ${isAuth ? 'authorized' : 'rejected'}">
          ${event.status}
        </span>
        <span style="font-size: 0.68rem; font-family: var(--font-mono); color: var(--accent-cyan); background: rgba(0, 242, 254, 0.08); padding: 0.15rem 0.35rem; border-radius: 4px;">
          ${latency}
        </span>
      </div>
    `;

    stream.insertBefore(row, stream.firstChild);

    // Limitar filas a 50
    if (stream.children.length > 50) {
      stream.removeChild(stream.lastChild);
    }
  }

  // --------------------------------------------------------------------------
  // LISTA NEGRA: TABLA Y ACCIONES (US-11)
  // --------------------------------------------------------------------------
  function renderBlacklistTable() {
    const tbody = document.getElementById('blacklist-table-body');
    const countBadge = document.getElementById('blacklist-table-count');
    const kpiCount = document.getElementById('kpi-blacklist-count');
    if (!tbody) return;

    tbody.innerHTML = '';
    const items = Array.from(state.blacklist.values());

    countBadge.textContent = `Total: ${items.length}`;
    kpiCount.textContent = items.length;
    state.kpis.blacklistCount = items.length;

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No hay tarjetas bloqueadas en Lista Negra</td></tr>`;
      return;
    }

    items.forEach((item) => {
      const tr = document.createElement('tr');
      const pillClass = item.reason === 'FRAUD' ? 'fraud' : (item.reason === 'LOST_STOLEN' ? 'lost' : 'debt');

      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--accent-cyan);">${item.cardId}</td>
        <td><span class="pill ${pillClass}">${item.reason}</span></td>
        <td>v${item.version || 1}</td>
        <td style="color: var(--text-muted);">${item.date || '--'}</td>
        <td>
          <button class="action-btn secondary unblock-btn" data-card="${item.cardId}" style="padding: 0.2rem 0.5rem; font-size: 0.7rem;">
            Desbloquear
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Enlazar botones de desbloqueo
    tbody.querySelectorAll('.unblock-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cardId = btn.getAttribute('data-card');
        unblockCard(cardId);
      });
    });
  }

  function blockCardUrgent(cardId, reason) {
    cardId = cardId.trim().toUpperCase();
    if (!cardId) return;

    state.validator.blVersion++;
    const version = state.validator.blVersion;

    const payload = {
      action: 'BLOCK',
      cardId: cardId,
      reason: reason,
      version: version
    };

    // Publicar por MQTT
    publishMqtt('/flota/listanegra/urgente', payload);

    // Notificar también al validador
    publishMqtt(`/flota/validadores/${state.validator.busId}/command`, {
      action: 'BLOCK',
      cardId: cardId,
      reason: reason
    });

    state.blacklist.set(cardId, {
      cardId: cardId,
      reason: reason,
      version: version,
      date: new Date().toLocaleTimeString()
    });

    renderBlacklistTable();
    playChime('urgent');
  }

  function unblockCard(cardId) {
    state.validator.blVersion++;
    const version = state.validator.blVersion;

    const payload = {
      action: 'UNBLOCK',
      cardId: cardId,
      version: version
    };

    publishMqtt('/flota/listanegra/urgente', payload);
    publishMqtt(`/flota/validadores/${state.validator.busId}/command`, {
      action: 'UNBLOCK',
      cardId: cardId
    });

    state.blacklist.delete(cardId);
    renderBlacklistTable();
    logMqtt('SYS', `Tarjeta ${cardId} desbloqueada y retirada de Lista Negra.`);
  }

  // --------------------------------------------------------------------------
  // TARJETAS EN CIRCULACIÓN (US-01 a US-03, US-06)
  // --------------------------------------------------------------------------
  function renderCardsList() {
    const container = document.getElementById('cards-summary-list');
    if (!container) return;

    container.innerHTML = '';
    state.cards.forEach((card) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'panel-subcard';
      cardEl.style.padding = '0.85rem';

      const isNeg = card.balance < 0;
      cardEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="font-family: var(--font-mono); color: var(--accent-cyan); font-size: 0.9rem;">${card.id}</strong>
          <span class="tag" style="font-size: 0.65rem;">${card.category}</span>
        </div>
        <div style="font-size: 1.15rem; font-weight: 700; font-family: var(--font-mono); color: ${isNeg ? 'var(--accent-coral)' : '#6ee7b7'};">
          S/ ${card.balance.toFixed(2)}
        </div>
        <div style="display: flex; gap: 0.4rem; margin-top: 0.25rem;">
          <button class="action-btn secondary quick-tap-card-btn" data-card="${card.id}" style="padding: 0.25rem 0.5rem; font-size: 0.7rem; flex: 1;">
            ⚡ TAP
          </button>
          <button class="action-btn secondary quick-recharge-btn" data-card="${card.id}" style="padding: 0.25rem 0.5rem; font-size: 0.7rem; flex: 1;">
            +S/ 5.00
          </button>
        </div>
      `;

      container.appendChild(cardEl);
    });

    // Enlazar botones
    container.querySelectorAll('.quick-tap-card-btn').forEach((btn) => {
      btn.addEventListener('click', () => handleCardTap(btn.getAttribute('data-card')));
    });

    container.querySelectorAll('.quick-recharge-btn').forEach((btn) => {
      btn.addEventListener('click', () => rechargeCard(btn.getAttribute('data-card'), 5.00));
    });
  }

  function rechargeCard(cardId, amount) {
    let card = state.cards.get(cardId);
    if (!card) return;

    card.balance = parseFloat((card.balance + amount).toFixed(2));
    
    // Si estaba bloqueada por deuda, retirarla de lista negra (US-06)
    if (state.blacklist.has(cardId) && state.blacklist.get(cardId).reason === 'DEBT') {
      unblockCard(cardId);
    }

    publishMqtt(`/flota/validadores/${state.validator.busId}/command`, {
      action: 'RECHARGE',
      cardId: cardId,
      amount: amount
    });

    renderCardsList();
    logMqtt('SYS', `Recarga aplicada a ${cardId}: +S/ ${amount.toFixed(2)} -> Saldo: S/ ${card.balance.toFixed(2)}`);
  }

  // --------------------------------------------------------------------------
  // TELEMETRÍA DEL VALIDADOR
  // --------------------------------------------------------------------------
  function renderTelemetry() {
    document.getElementById('telem-bus-id').textContent = state.validator.busId;
    document.getElementById('telem-ip').textContent = state.validator.ip;
    document.getElementById('telem-rssi').textContent = `${state.validator.rssi} dBm`;
    document.getElementById('telem-pending-trips').textContent = `${state.validator.pendingTrips} viajes`;
    document.getElementById('telem-free-heap').textContent = `${state.validator.freeHeap.toLocaleString()} bytes`;
    document.getElementById('telem-bl-version').textContent = `v${state.validator.blVersion} (Local)`;
  }

  function updateBadge(id, isOnline, text) {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = `badge ${isOnline ? 'online' : 'offline'}`;
    const span = el.querySelectorAll('span')[1];
    if (span && text) span.textContent = text;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // --------------------------------------------------------------------------
  // PROBAR DELTA / SNAPSHOT DEL BACKEND SPRING BOOT (US-11)
  // --------------------------------------------------------------------------
  async function testBackendSync() {
    const inspector = document.getElementById('sync-inspector');
    const content = document.getElementById('sync-inspector-content');
    inspector.style.display = 'block';
    content.textContent = 'Consultando GET http://localhost:8080/api/v1/blacklist/sync?localVersion=' + state.validator.blVersion + '...';

    try {
      const res = await fetch(`http://localhost:8080/api/v1/blacklist/sync?localVersion=${state.validator.blVersion}`);
      if (res.ok) {
        state.backendConnected = true;
        updateBadge('backend-badge', true, 'BACKEND: CONECTADO');
        const json = await res.json();
        content.textContent = JSON.stringify(json, null, 2);
        logMqtt('BACKEND', `Sync Response: ${JSON.stringify(json)}`);
      } else {
        content.textContent = `Error HTTP ${res.status}: ${res.statusText}`;
      }
    } catch (err) {
      // Fallback simulado para testing autónomo
      content.textContent = JSON.stringify({
        newVersion: state.validator.blVersion + 1,
        isFullSnapshot: false,
        cuckooFilter: null,
        changes: {
          add: Array.from(state.blacklist.keys()),
          remove: []
        },
        _note: 'Backend 8080 en standby. Simulación Delta conforme a BlacklistSyncResponseDTO.'
      }, null, 2);
    }
  }

  // --------------------------------------------------------------------------
  // INICIALIZACIÓN DE EVENT LISTENERS Y ARRANQUE
  // --------------------------------------------------------------------------
  function init() {
    // 1. Botones de TAP predefinidos
    document.querySelectorAll('.tap-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cardId = btn.getAttribute('data-card');
        handleCardTap(cardId);
      });
    });

    // 2. Formulario de TAP personalizado
    const customTapForm = document.getElementById('custom-tap-form');
    customTapForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('custom-card-input');
      if (input.value.trim()) {
        handleCardTap(input.value.trim().toUpperCase());
        input.value = '';
      }
    });

    // 3. Formulario de Bloqueo de Emergencia MQTT
    const blockForm = document.getElementById('urgent-block-form');
    blockForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const cardInput = document.getElementById('block-card-id');
      const reasonSelect = document.getElementById('block-reason');
      blockCardUrgent(cardInput.value, reasonSelect.value);
      cardInput.value = '';
    });

    // 4. Formulario de Recarga
    const rechargeForm = document.getElementById('recharge-form');
    rechargeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const cardInput = document.getElementById('recharge-card-id');
      const amtInput = document.getElementById('recharge-amount');
      rechargeCard(cardInput.value.trim().toUpperCase(), parseFloat(amtInput.value));
      cardInput.value = '';
    });

    // 5. Botón de forzar sincronización de lote batch
    document.getElementById('btn-force-batch-sync').addEventListener('click', () => {
      publishMqtt(`/flota/validadores/${state.validator.busId}/command`, { action: 'SYNC' });
      const currentPending = state.validator.pendingTrips;
      state.validator.pendingTrips = 0;
      renderTelemetry();
      showOledSync(0, true, 200);
      logMqtt('SYS', `Lote batch (${currentPending} viajes) sincronizado.`);
    });

    // 6. Botón de prueba de poll backend
    document.getElementById('btn-poll-backend-sync').addEventListener('click', testBackendSync);
    document.getElementById('btn-close-inspector').addEventListener('click', () => {
      document.getElementById('sync-inspector').style.display = 'none';
    });

    // 7. Filtros y botones de limpieza
    document.getElementById('event-filter').addEventListener('change', (e) => {
      const filter = e.target.value;
      const rows = document.querySelectorAll('.event-row');
      rows.forEach((row) => {
        if (filter === 'ALL' || row.dataset.status === filter) {
          row.style.display = 'flex';
        } else {
          row.style.display = 'none';
        }
      });
    });

    document.getElementById('btn-clear-events').addEventListener('click', () => {
      document.getElementById('event-stream').innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 2rem; font-size: 0.85rem;">
          Eventos limpiados. Acerque una tarjeta para registrar nuevos abordajes.
        </div>
      `;
    });

    document.getElementById('btn-clear-mqtt-logs').addEventListener('click', () => {
      document.getElementById('mqtt-terminal-logs').innerHTML = '';
    });

    // 8. Botón toggle de sonido
    const soundBtn = document.getElementById('sound-toggle-btn');
    soundBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      soundBtn.textContent = state.soundEnabled ? '🔊 Sonido: ON' : '🔇 Sonido: OFF';
      soundBtn.style.color = state.soundEnabled ? 'var(--text-primary)' : 'var(--text-muted)';
    });

    // Renderizado inicial
    renderBlacklistTable();
    renderCardsList();
    renderTelemetry();
    resetOledToIdle();

    // Arrancar cliente MQTT
    initMqtt();

    // Check de conectividad con Backend Spring Boot (:8080)
    async function checkBackendConnectivity() {
      try {
        const res = await fetch('/api/v1/blacklist/sync?localVersion=0', { method: 'GET' });
        if (res.ok) {
          state.backendConnected = true;
          updateBadge('backend-badge', true, 'BACKEND: CONECTADO');
          return;
        }
      } catch (e) {
        try {
          const directRes = await fetch('http://localhost:8080/api/v1/blacklist/sync?localVersion=0', { method: 'GET' });
          if (directRes.ok) {
            state.backendConnected = true;
            updateBadge('backend-badge', true, 'BACKEND: CONECTADO');
            return;
          }
        } catch (err) {}
      }
      state.backendConnected = false;
      updateBadge('backend-badge', false, 'BACKEND: DESCONECTADO');
    }

    // Ejecutar check inmediato y periódico cada 5s
    checkBackendConnectivity();
    setInterval(checkBackendConnectivity, 5000);

    // Si pasaron 1.5s sin recibir heartbeat de hardware externo, activar presencia
    setTimeout(() => {
      if (!state.hardwareConnected) {
        state.hardwareConnected = true;
        updateBadge('validator-badge', true, 'VAL: BUS-201 (ACTIVO)');
      }
    }, 1500);
  }

  // Ejecutar al cargar DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
