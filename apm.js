import crypto from 'crypto';

// Configuration and State
const ADMIN_PASSWORD = process.env.ADMIN_MONITOR_PASSWORD || 'mbarry@admin2026';
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';

const startTime = Date.now();
const MAX_LATENCIES = 120;
const MAX_RECENT_REQUESTS = 50;
const SESSION_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes timeout for live sessions

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
const adminTokens = new Set(['admin_token_master_' + crypto.randomBytes(8).toString('hex')]);

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
  // Strip IPv6 prefix if present
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

// Send instant notification to Discord Webhook
async function sendDiscordNotification(session, currentPath) {
  if (!DISCORD_WEBHOOK_URL) return;

  try {
    const embed = {
      title: '🎯 Visiteur en direct sur le Portfolio !',
      description: `Un utilisateur consulte actuellement **${currentPath || '/'}**.`,
      color: 0x00F5D4, // Neon Cyan
      fields: [
        { name: '💻 Appareil', value: `${session.device} • ${session.browser} (${session.os})`, inline: true },
        { name: '🌍 Pays / IP', value: `${session.country} (${session.maskedIp})`, inline: true },
        { name: '⏱️ Session', value: `Début : ${new Date(session.firstSeen).toLocaleTimeString('fr-FR')}`, inline: true },
        { name: '📊 Dashboard APM', value: `[Ouvrir l'Observabilité](https://mbarry.is-a.dev/#monitoring)`, inline: false },
      ],
      footer: { text: 'Portfolio Mouhamet Barry — APM & Observabilité Live' },
      timestamp: new Date().toISOString(),
    };

    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch (err) {
    console.error('Erreur webhook Discord APM :', err.message);
  }
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
      lastSeen: now,
      pageViews: 1,
      currentPath: path,
    };
    sessions.set(sessionId, session);

    // Notify Discord on first visit
    if (!notifiedSessions.has(sessionId) && !isAsset) {
      notifiedSessions.add(sessionId);
      sendDiscordNotification(session, path);
    }
  } else {
    session.lastSeen = now;
    if (!isAsset) {
      session.pageViews += 1;
      session.currentPath = path;
    }
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
      time: new Date().toLocaleTimeString('fr-FR'),
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
    const sessionData = {
      id: session.id,
      ip: isAdmin ? session.rawIp : session.maskedIp,
      country: session.country,
      device: session.device,
      os: session.os,
      browser: session.browser,
      firstSeen: session.firstSeen,
      lastSeen: session.lastSeen,
      pageViews: session.pageViews,
      currentPath: session.currentPath,
      isOnline,
    };

    if (isOnline) activeSessions.push(sessionData);
    allSessions.push(sessionData);
  }

  // Sort sessions: active first, then most recent
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
    recentSessions: allSessions.slice(0, 10),
    recentRequests: metrics.recentRequests.slice(0, 15).map(r => ({
      ...r,
      ip: isAdmin ? r.ip : maskIp(r.ip),
    })),
    isAdmin,
  };
}

// Router handler for APM API endpoints (Express and Connect/Vite compatible)
export async function handleApmApi(req, res) {
  const url = (req.url || '').split('?')[0];

  // Enable CORS & JSON headers
  res.setHeader('Content-Type', 'application/json');

  // Verify Admin Auth
  const authHeader = req.headers['authorization'] || '';
  const adminKey = req.headers['x-admin-key'] || '';
  const token = authHeader.replace(/^Bearer\s+/, '') || adminKey;
  const isAdmin = adminTokens.has(token);

  if (url === '/api/monitor/stats' || url.endsWith('/api/monitor/stats')) {
    const stats = getApmStats(isAdmin);
    res.statusCode = 200;
    return res.end(JSON.stringify(stats));
  }

  if (url === '/api/monitor/ping' || url.endsWith('/api/monitor/ping')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let path = '/';
      try {
        const parsed = JSON.parse(body || '{}');
        if (parsed.path) path = parsed.path;
      } catch {
        // ignore
      }

      touchVisitorSession(req, path);
      const stats = getApmStats(isAdmin);
      res.statusCode = 200;
      return res.end(JSON.stringify({ success: true, liveVisitorsCount: stats.liveVisitorsCount }));
    });
    return;
  }

  if (url === '/api/monitor/auth' || url.endsWith('/api/monitor/auth')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { password } = JSON.parse(body || '{}');
        if (password && password === ADMIN_PASSWORD) {
          const newToken = 'admin_' + crypto.randomBytes(16).toString('hex');
          adminTokens.add(newToken);
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true, token: newToken }));
        }
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: 'Mot de passe administrateur incorrect.' }));
      } catch {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Données invalides.' }));
      }
    });
    return;
  }

  if (url === '/api/monitor/reset' || url.endsWith('/api/monitor/reset')) {
    if (!isAdmin) {
      res.statusCode = 403;
      return res.end(JSON.stringify({ error: 'Accès réservé aux administrateurs.' }));
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
