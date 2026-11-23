import crypto from 'crypto';

// Configuration and State
const ADMIN_PASSWORD = process.env.ADMIN_MONITOR_PASSWORD || 'mbarry@admin2026';
// Never hardcode Discord webhook URLs in source code (GitHub Secret Scanning auto-revokes public webhooks)
let activeDiscordWebhookUrl = (process.env.DISCORD_WEBHOOK_URL || '').trim();

async function postDiscordEmbed(embed, context = 'APM') {
  const url = activeDiscordWebhookUrl || (process.env.DISCORD_WEBHOOK_URL || '').trim();
  if (!url) {
    return { ok: false, status: 0, error: 'DISCORD_WEBHOOK_URL non configuré sur le serveur.' };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(`Erreur webhook Discord (${context}) HTTP ${res.status} :`, errText);
      return { ok: false, status: res.status, error: `Discord HTTP ${res.status} : ${errText || res.statusText}` };
    }
    return { ok: true, status: res.status };
  } catch (err) {
    console.error(`Erreur webhook Discord (${context}) :`, err.message);
    return { ok: false, status: 0, error: err.message };
  }
}

const startTime = Date.now();
const MAX_LATENCIES = 120;
const MAX_RECENT_REQUESTS = 50;
const SESSION_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes timeout for live sessions
const EVENT_ALERT_DEBOUNCE_MS = 10 * 1000; // 10s cooldown per event type to prevent webhook spam

const metrics = {
  totalRequests: 0,
  requestsByStatus: { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 },
  latencies: [],
  routes: {},
  recentRequests: [],
};

// Sessions Map: sessionId -> sessionObj
const sessions = new Map();
const notifiedSessions = new Set();

// Security: HMAC-signed Admin Tokens (24h TTL) & Brute-Force Protection
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const TOKEN_SECRET = crypto
  .createHash('sha256')
  .update(`apm_jwt_secret::${ADMIN_PASSWORD}`)
  .digest('hex');
const revokedTokens = new Set();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const loginAttempts = new Map(); // ip -> { count, lockedUntil }

function createAdminToken() {
  const payload = Buffer.from(
    JSON.stringify({
      role: 'admin',
      exp: Date.now() + TOKEN_TTL_MS,
      jti: crypto.randomBytes(8).toString('hex'),
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyAdminToken(token) {
  if (!token || typeof token !== 'string' || revokedTokens.has(token)) {
    return false;
  }
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return false;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return decoded.role === 'admin' && typeof decoded.exp === 'number' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

function verifyPassword(input = '') {
  const inputHash = crypto.createHash('sha256').update(String(input).trim()).digest();
  const expectedHash = crypto.createHash('sha256').update(ADMIN_PASSWORD.trim()).digest();
  return crypto.timingSafeEqual(inputHash, expectedHash);
}

async function sendDiscordSecurityAlert(ip, attempts) {
  const embed = {
    title: '🚨 Alerte Sécurité : Tentatives d’accès Admin bloquées',
    description: `Plusieurs tentatives de connexion échouées sur la console de Monitoring privée.`,
    color: 0xEF4444, // Red
    fields: [
      { name: '🌐 IP Source', value: ip, inline: true },
      { name: '🔁 Tentatives', value: `${attempts} échecs`, inline: true },
      { name: '🔒 Action', value: 'IP bloquée pour 15 minutes (HTTP 429)', inline: false },
    ],
    footer: { text: 'Portfolio Mouhamet Barry — Protection Anti-Brute-Force' },
    timestamp: new Date().toISOString(),
  };

  await postDiscordEmbed(embed, 'Security');
}

// Date & Time formatting helpers (French 24h format)
function formatDateTime(ms) {
  const d = new Date(ms);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year} à ${hours}:${minutes}:${seconds}`;
}

function formatTime(ms) {
  const d = new Date(ms);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// Parse User-Agent
function parseUserAgent(ua = '') {
  let device = 'Desktop';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    device = 'Tablet';
  } else if (/(mobi|ipod|iphone|android)/i.test(ua)) {
    device = 'Mobile';
  }

  let os = 'Autre';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  let browser = 'Navigateur Web';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';

  return { device, os, browser };
}

// Anonymize IP address for privacy & RGPD compliance
function maskIp(ip = '') {
  if (!ip) return '127.0.0.1';
  const cleanIp = ip.replace(/^::ffff:/, '');
  if (cleanIp.includes('.')) {
    const parts = cleanIp.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.***.***`;
    }
  }
  return cleanIp.substring(0, 8) + '***';
}

// Extract real client IP
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.connection?.remoteAddress || '127.0.0.1';
}

// Generate consistent session hash per client per day
function getSessionId(req) {
  const ip = getClientIp(req);
  const ua = req.headers['user-agent'] || 'unknown';
  const day = new Date().toISOString().slice(0, 10);
  return 'sess_' + crypto.createHash('sha256').update(`${ip}-${ua}-${day}`).digest('hex').slice(0, 12);
}

// Send instant notification to Discord Webhook on new session
async function sendDiscordNotification(session, currentPath) {
  const embed = {
    title: '🎯 Nouveau Visiteur sur le Portfolio !',
    description: `Un utilisateur navigue actuellement sur le site.`,
    color: 0x00F5D4, // Neon Cyan
    fields: [
      { name: '📅 Date & Heure exacte', value: session.firstSeenFormatted, inline: false },
      { name: '💻 Appareil', value: `${session.device} • ${session.browser} (${session.os})`, inline: true },
      { name: '🌍 Pays / IP', value: `${session.country} (${session.maskedIp})`, inline: true },
      { name: '🧭 Entrée', value: currentPath || 'Accueil (/)', inline: true },
      { name: '📊 Dashboard APM', value: `[Ouvrir l'Observabilité](https://mbarry.is-a.dev/#monitoring)`, inline: false },
    ],
    footer: { text: 'Portfolio Mouhamet Barry — APM & Observabilité Live' },
    timestamp: new Date().toISOString(),
  };

  await postDiscordEmbed(embed, 'NewVisitor');
}

// Send instant notification to Discord Webhook for key actions (CV download, project click, etc.)
async function sendDiscordEventNotification(session, event, label, details) {
  let title = '⚡ Interaction Détectée sur le Portfolio';
  let color = 0x00F5D4;
  let description = `Un visiteur a interagi : **${label || event}**`;

  if (event === 'CV_DOWNLOAD') {
    title = '📄 Téléchargement de CV Détecté !';
    color = 0x10B981; // Emerald Green
    description = `🎯 Un visiteur vient de télécharger votre **CV au format PDF** !`;
  } else if (event === 'PROJECT_CLICK') {
    title = `🚀 Consultation de Projet : ${label || 'Projet'}`;
    color = 0x3B82F6; // Blue
    description = `Un visiteur s'intéresse à l'un de vos projets et consulte son lien externe ou GitHub.`;
  } else if (event === 'CONTACT_CLICK') {
    title = `📬 Intérêt Contact : ${label || 'Contact'}`;
    color = 0xA855F7; // Purple
    description = `Un visiteur a cliqué sur un moyen de contact direct.`;
  }

  // Trace past sections viewed
  const sectionsSummary = (session.timeline || [])
    .filter((t) => t.type === 'section' || t.type === 'page')
    .slice(-4)
    .map((t) => t.name)
    .join(' ➔ ') || session.currentPath || 'Accueil';

  const fields = [
    { name: '👤 Visiteur', value: `${session.device} • ${session.browser} (${session.os})`, inline: true },
    { name: '🌍 Pays / IP', value: `${session.country} (${session.maskedIp})`, inline: true },
    { name: '🕒 Heure d’arrivée', value: session.firstSeenTime || formatTime(session.firstSeen), inline: true },
  ];

  if (details?.url) {
    fields.push({ name: '🔗 Lien', value: details.url, inline: true });
  }
  if (details?.source) {
    fields.push({ name: '📍 Source', value: details.source, inline: true });
  }

  fields.push({ name: '🧭 Parcours avant action', value: sectionsSummary, inline: false });
  fields.push({ name: '📊 Dashboard APM', value: `[Accéder au Monitoring Live](https://mbarry.is-a.dev/#monitoring)`, inline: false });

  const embed = {
    title,
    description,
    color,
    fields,
    footer: { text: 'Portfolio Mouhamet Barry — Alertes Événements APM' },
    timestamp: new Date().toISOString(),
  };

  await postDiscordEmbed(embed, `Event:${event}`);
}

// Register or update active visitor session
function touchVisitorSession(req, explicitPath = null) {
  const rawIp = getClientIp(req);
  const ua = req.headers['user-agent'] || '';
  const sessionId = getSessionId(req);
  const path = explicitPath || req.url || '/';

  // Ignore static assets (.js, .css, .png, etc.) from counting as new page views
  const isAsset = /\.(png|jpg|jpeg|svg|css|js|ico|woff2?|map|pdf)$/i.test(path);
  const now = Date.now();

  let session = sessions.get(sessionId);
  const { device, os, browser } = parseUserAgent(ua);
  const country = req.headers['cf-ipcountry'] || req.headers['x-country-code'] || 'Sénégal / Web';

  if (!session) {
    session = {
      id: sessionId,
      rawIp,
      maskedIp: maskIp(rawIp),
      country,
      device,
      os,
      browser,
      firstSeen: now,
      firstSeenFormatted: formatDateTime(now),
      firstSeenTime: formatTime(now),
      lastSeen: now,
      lastSeenFormatted: formatDateTime(now),
      lastSeenTime: formatTime(now),
      pageViews: 1,
      currentPath: path,
      timeline: [
        {
          id: crypto.randomBytes(3).toString('hex'),
          type: 'page',
          name: path.startsWith('#') ? `Section ${path}` : `Entrée (${path})`,
          time: formatTime(now),
          timestamp: now,
        },
      ],
      actions: [],
      lastAlertedEvents: {},
    };
    sessions.set(sessionId, session);

    // Notify Discord on first visit
    if (!notifiedSessions.has(sessionId) && !isAsset) {
      notifiedSessions.add(sessionId);
      sendDiscordNotification(session, path);
    }
  } else {
    session.lastSeen = now;
    session.lastSeenFormatted = formatDateTime(now);
    session.lastSeenTime = formatTime(now);

    if (!isAsset) {
      session.pageViews += 1;

      // Track section change in timeline if path changed
      if (explicitPath && session.currentPath !== explicitPath) {
        session.currentPath = explicitPath;
        const sectionName = explicitPath.startsWith('#') ? `Section ${explicitPath}` : `Page ${explicitPath}`;

        session.timeline.push({
          id: crypto.randomBytes(3).toString('hex'),
          type: 'section',
          name: sectionName,
          time: formatTime(now),
          timestamp: now,
        });

        // Limit timeline size to 35 entries
        if (session.timeline.length > 35) {
          session.timeline.shift();
        }
      }
    }
  }

  return session;
}

// Track special interaction events (CV download, project clicks, contact clicks)
function trackVisitorEvent(req, { event, label, details }) {
  const session = touchVisitorSession(req);
  const now = Date.now();

  if (!session.actions.includes(event)) {
    session.actions.push(event);
  }

  // Add event to session timeline
  session.timeline.push({
    id: crypto.randomBytes(3).toString('hex'),
    type: 'action',
    actionType: event,
    name: label || event,
    time: formatTime(now),
    timestamp: now,
    details: details || null,
  });

  if (session.timeline.length > 35) {
    session.timeline.shift();
  }

  // Check debounce to avoid spamming Discord
  session.lastAlertedEvents = session.lastAlertedEvents || {};
  const lastAlertTime = session.lastAlertedEvents[event] || 0;

  if (now - lastAlertTime > EVENT_ALERT_DEBOUNCE_MS) {
    session.lastAlertedEvents[event] = now;
    sendDiscordEventNotification(session, event, label, details);
  }

  return session;
}

// APM Tracker Middleware
export function apmMiddleware(req, res, next) {
  const start = performance.now();
  const url = req.url || '/';

  // Do not record internal healthcheck loops
  if (url === '/health' || url.startsWith('/api/monitor')) {
    return next();
  }

  // Update session
  touchVisitorSession(req);

  res.on('finish', () => {
    const duration = Math.round((performance.now() - start) * 100) / 100;
    const status = res.statusCode || 200;

    metrics.totalRequests += 1;

    // Status category
    if (status >= 200 && status < 300) metrics.requestsByStatus['2xx'] += 1;
    else if (status >= 300 && status < 400) metrics.requestsByStatus['3xx'] += 1;
    else if (status >= 400 && status < 500) metrics.requestsByStatus['4xx'] += 1;
    else if (status >= 500) metrics.requestsByStatus['5xx'] += 1;

    // Latency
    metrics.latencies.push(duration);
    if (metrics.latencies.length > MAX_LATENCIES) {
      metrics.latencies.shift();
    }

    // Top routes
    const routeKey = url.split('?')[0];
    metrics.routes[routeKey] = (metrics.routes[routeKey] || 0) + 1;

    // Recent requests
    metrics.recentRequests.unshift({
      id: crypto.randomBytes(4).toString('hex'),
      time: formatTime(Date.now()),
      method: req.method,
      url: routeKey,
      status,
      duration,
      ip: maskIp(getClientIp(req)),
    });

    if (metrics.recentRequests.length > MAX_RECENT_REQUESTS) {
      metrics.recentRequests.pop();
    }
  });

  next();
}

// Get APM Statistics Snapshot
export function getApmStats(isAdmin = false) {
  const now = Date.now();
  const activeSessions = [];
  const allSessions = [];

  for (const session of sessions.values()) {
    const isOnline = now - session.lastSeen < SESSION_TIMEOUT_MS;
    const durationSeconds = Math.round((session.lastSeen - session.firstSeen) / 1000);

    const sessionData = {
      id: session.id,
      ip: isAdmin ? session.rawIp : session.maskedIp,
      country: session.country,
      device: session.device,
      os: session.os,
      browser: session.browser,
      firstSeen: session.firstSeen,
      firstSeenFormatted: session.firstSeenFormatted || formatDateTime(session.firstSeen),
      firstSeenTime: session.firstSeenTime || formatTime(session.firstSeen),
      lastSeen: session.lastSeen,
      lastSeenFormatted: session.lastSeenFormatted || formatDateTime(session.lastSeen),
      lastSeenTime: session.lastSeenTime || formatTime(session.lastSeen),
      durationSeconds,
      pageViews: session.pageViews,
      currentPath: session.currentPath,
      timeline: session.timeline || [],
      actions: session.actions || [],
      isOnline,
    };

    if (isOnline) activeSessions.push(sessionData);
    allSessions.push(sessionData);
  }

  // Sort sessions: active first, then most recent lastSeen
  allSessions.sort((a, b) => b.lastSeen - a.lastSeen);

  // Compute Latency stats
  const latencies = metrics.latencies;
  const count = latencies.length;
  const avgLatency = count > 0 ? Math.round((latencies.reduce((a, b) => a + b, 0) / count) * 10) / 10 : 0;

  let p95Latency = 0;
  if (count > 0) {
    const sorted = [...latencies].sort((a, b) => a - b);
    p95Latency = sorted[Math.floor(count * 0.95)] || sorted[count - 1];
  }

  const mem = process.memoryUsage();
  const uptimeSeconds = Math.floor((now - startTime) / 1000);

  return {
    uptimeSeconds,
    totalRequests: metrics.totalRequests,
    requestsByStatus: metrics.requestsByStatus,
    avgLatency,
    p95Latency,
    memory: {
      heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 10) / 10,
      heapTotalMb: Math.round((mem.heapTotal / 1024 / 1024) * 10) / 10,
      rssMb: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
    },
    liveVisitorsCount: activeSessions.length,
    activeSessions,
    recentSessions: allSessions.slice(0, 15),
    recentRequests: metrics.recentRequests.slice(0, 15).map((r) => ({
      ...r,
      ip: isAdmin ? r.ip : maskIp(r.ip),
    })),
    isAdmin,
  };
}

// Helper to safely get body whether already parsed by Express (req.body) or streaming (Connect/Vite)
async function parseRequestBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string' && req.body) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  if (req.readableEnded) {
    return {};
  }
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

// Router handler for APM API endpoints (Express and Connect/Vite compatible)
export async function handleApmApi(req, res) {
  const url = (req.originalUrl || req.url || '').split('?')[0];

  // Enable CORS & JSON headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  // Verify Admin Auth (HMAC-signed token with 24h TTL)
  const authHeader = req.headers['authorization'] || '';
  const adminKey = req.headers['x-admin-key'] || '';
  const token = authHeader.replace(/^Bearer\s+/, '') || adminKey;
  const isAdmin = verifyAdminToken(token);

  if (url.endsWith('/stats') || url.includes('/monitor/stats')) {
    if (!isAdmin) {
      res.statusCode = 401;
      return res.end(JSON.stringify({ error: 'Accès strictement réservé à l’administrateur.' }));
    }
    const stats = getApmStats(true);
    res.statusCode = 200;
    return res.end(JSON.stringify(stats));
  }

  if (url.endsWith('/ping') || url.includes('/monitor/ping')) {
    const parsed = await parseRequestBody(req);
    const path = parsed?.path || '/';

    if (path !== '#monitoring') {
      touchVisitorSession(req, path);
    }
    res.statusCode = 200;
    return res.end(JSON.stringify({ success: true }));
  }

  if (url.endsWith('/event') || url.includes('/monitor/event')) {
    const parsed = await parseRequestBody(req);
    const { event, label, details } = parsed || {};

    if (event) {
      trackVisitorEvent(req, { event, label, details });
    }
    res.statusCode = 200;
    return res.end(JSON.stringify({ success: true }));
  }

  if (url.endsWith('/auth') || url.includes('/monitor/auth')) {
    const clientIp = getClientIp(req);
    const now = Date.now();
    const record = loginAttempts.get(clientIp);

    if (record && record.lockedUntil > now) {
      const remainingMin = Math.ceil((record.lockedUntil - now) / 60000);
      res.statusCode = 429;
      return res.end(
        JSON.stringify({
          error: `Trop de tentatives échouées. Accès temporairement bloqué (${remainingMin} min).`,
        })
      );
    }

    const parsed = await parseRequestBody(req);
    const password = parsed?.password;

    if (password && verifyPassword(password)) {
      loginAttempts.delete(clientIp);
      const newToken = createAdminToken();
      res.statusCode = 200;
      return res.end(JSON.stringify({ success: true, token: newToken }));
    }

    const nextCount = (record?.count || 0) + 1;
    if (nextCount >= MAX_LOGIN_ATTEMPTS) {
      loginAttempts.set(clientIp, { count: nextCount, lockedUntil: now + LOGIN_LOCKOUT_MS });
      sendDiscordSecurityAlert(clientIp, nextCount);
      res.statusCode = 429;
      return res.end(
        JSON.stringify({
          error: 'Trop de tentatives échouées. Votre IP est bloquée pour 15 minutes.',
        })
      );
    }

    loginAttempts.set(clientIp, { count: nextCount, lockedUntil: 0 });
    res.statusCode = 401;
    return res.end(
      JSON.stringify({
        error: `Mot de passe administrateur incorrect (${MAX_LOGIN_ATTEMPTS - nextCount} essai${MAX_LOGIN_ATTEMPTS - nextCount > 1 ? 's' : ''} restant${MAX_LOGIN_ATTEMPTS - nextCount > 1 ? 's' : ''}).`,
      })
    );
  }

  if (url.endsWith('/logout') || url.includes('/monitor/logout')) {
    if (token) {
      revokedTokens.add(token);
    }
    res.statusCode = 200;
    return res.end(JSON.stringify({ success: true }));
  }

  if (url.endsWith('/test-discord') || url.includes('/monitor/test-discord')) {
    if (!isAdmin) {
      res.statusCode = 403;
      return res.end(JSON.stringify({ error: 'Accès réservé à l’administrateur.' }));
    }
    const result = await postDiscordEmbed(
      {
        title: '✅ Test Webhook Discord — Opérationnel !',
        description: 'La connexion entre votre APM Portfolio et Discord fonctionne parfaitement.',
        color: 0x10B981,
        fields: [
          { name: '🕒 Date & Heure', value: formatDateTime(Date.now()), inline: true },
          { name: '🛡️ Statut', value: 'Authentifié Admin', inline: true },
        ],
        footer: { text: 'Portfolio Mouhamet Barry — Test Manuel' },
        timestamp: new Date().toISOString(),
      },
      'TestManual'
    );
    res.statusCode = result.ok ? 200 : 502;
    return res.end(JSON.stringify(result.ok ? { success: true, message: 'Alerte test envoyée sur Discord !' } : { error: result.error }));
  }

  if (url.endsWith('/webhook') || url.includes('/monitor/webhook')) {
    if (!isAdmin) {
      res.statusCode = 403;
      return res.end(JSON.stringify({ error: 'Accès réservé à l’administrateur.' }));
    }
    const parsed = await parseRequestBody(req);
    const newUrl = (parsed?.webhookUrl || '').trim();
    if (!newUrl || !/^https:\/\/(canary\.|ptb\.)?discord(app)?\.com\/api\/webhooks\//i.test(newUrl)) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'URL de webhook Discord invalide.' }));
    }
    activeDiscordWebhookUrl = newUrl;
    res.statusCode = 200;
    return res.end(JSON.stringify({ success: true, message: 'Webhook Discord mis à jour en mémoire.' }));
  }

  if (url.endsWith('/reset') || url.includes('/monitor/reset')) {
    if (!isAdmin) {
      res.statusCode = 403;
      return res.end(JSON.stringify({ error: 'Accès réservé à l’administrateur.' }));
    }
    metrics.latencies = [];
    metrics.recentRequests = [];
    metrics.totalRequests = 0;
    metrics.requestsByStatus = { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 };
    res.statusCode = 200;
    return res.end(JSON.stringify({ success: true, message: 'Métriques APM réinitialisées.' }));
  }

  res.statusCode = 404;
  return res.end(JSON.stringify({ error: 'Endpoint introuvable.' }));
}
