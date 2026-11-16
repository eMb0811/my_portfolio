import { useState, useEffect } from 'react';
import styles from './Monitoring.module.css';

function formatUptime(totalSeconds = 0) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}j ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

function Monitoring({ onBack }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('apm_admin_token') || '');

  // Fetch telemetry data from server APM
  async function fetchStats() {
    try {
      const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
      const url = baseUrl ? `${baseUrl}/api/monitor/stats` : '/api/monitor/stats';

      const headers = {};
      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setLoading(false);
      }
    } catch (err) {
      console.warn('APM Fetch warning:', err.message);
    }
  }

  // Send periodic live ping for visitor tracking
  async function sendPing() {
    try {
      const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
      const url = baseUrl ? `${baseUrl}/api/monitor/ping` : '/api/monitor/ping';

      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '#monitoring' }),
      });
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
        const url = baseUrl ? `${baseUrl}/api/monitor/stats` : '/api/monitor/stats';
        const headers = {};
        if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;
        const res = await fetch(url, { headers });
        if (res.ok && isMounted) {
          const data = await res.json();
          setStats(data);
          setLoading(false);
        }
      } catch (err) {
        console.warn('APM Fetch warning:', err.message);
      }
    }

    sendPing();
    loadStats();

    const intervalStats = setInterval(loadStats, 3000);
    const intervalPing = setInterval(sendPing, 20000);

    return () => {
      isMounted = false;
      clearInterval(intervalStats);
      clearInterval(intervalPing);
    };
  }, [adminToken]);

  // Handle Admin login
  async function handleAdminAuth(e) {
    e.preventDefault();
    setAuthError('');

    try {
      const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
      const url = baseUrl ? `${baseUrl}/api/monitor/auth` : '/api/monitor/auth';

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Mot de passe invalide.');
      }

      localStorage.setItem('apm_admin_token', data.token);
      setAdminToken(data.token);
      setAdminModalOpen(false);
      setPasswordInput('');
      fetchStats();
    } catch (err) {
      setAuthError(err.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem('apm_admin_token');
    setAdminToken('');
    fetchStats();
  }

  async function handleResetMetrics() {
    if (!window.confirm('Voulez-vous réinitialiser les compteurs de requêtes et de latence APM ?')) {
      return;
    }

    try {
      const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
      const url = baseUrl ? `${baseUrl}/api/monitor/reset` : '/api/monitor/reset';

      await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });
      fetchStats();
    } catch (err) {
      alert('Erreur lors du reset : ' + err.message);
    }
  }

  const liveCount = stats?.liveVisitorsCount || (loading ? 1 : 0);
  const avgLat = stats?.avgLatency || 0;
  const p95Lat = stats?.p95Latency || 0;
  const totalReq = stats?.totalRequests || 0;
  const heapMb = stats?.memory?.heapUsedMb || 0;
  const heapTotalMb = stats?.memory?.heapTotalMb || 0;
  const uptimeStr = formatUptime(stats?.uptimeSeconds || 0);
  const isAdmin = stats?.isAdmin || false;

  return (
    <div className={styles.monitoringContainer}>
      <div className={styles.ambientGlow} />

      <div className={styles.inner}>
        {/* Top bar */}
        <div className={styles.topNav}>
          <button type="button" onClick={onBack} className={styles.backBtn}>
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Retour au Portfolio</span>
          </button>

          <div>
            {isAdmin ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className={`${styles.adminBtn} ${styles.adminBtnUnlocked}`}>
                  🔓 Mode Admin Actif
                </span>
                <button type="button" onClick={handleLogout} className={styles.backBtn} title="Se déconnecter">
                  Déconnexion
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAdminModalOpen(true)}
                className={styles.adminBtn}
              >
                <span>🔑 Accès Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Intro */}
        <div className={styles.headerIntro}>
          <div className={styles.badgeLive}>
            <span className={styles.liveDotWrapper}>
              <span className={styles.livePing} />
              <span className={styles.liveDot} />
            </span>
            <span>APM &amp; OBSERVABILITÉ EN DIRECT</span>
          </div>
          <h1 className={styles.title}>
            Télémétrie applicative &amp; <span className={styles.gradient}>visiteurs en temps réel</span>
          </h1>
          <p className={styles.subtitle}>
            Mesure en continu des performances du serveur Node.js / Express, de la latence HTTP (P95), de l'empreinte mémoire et du flux des visiteurs en direct sur le portfolio.
          </p>
        </div>

        {/* APM 4 Metrics Cards */}
        <div className={styles.metricsGrid}>
          {/* 1. Live Visitors */}
          <div className={styles.metricCard}>
            <div className={styles.metricCardTop}>
              <span className={styles.metricLabel}>Visiteurs en direct</span>
              <span className={`${styles.metricBadge} ${styles.badgeGood}`}>
                Actif (3 min)
              </span>
            </div>
            <div className={styles.metricValue}>
              <span style={{ color: '#00F5D4' }}>{liveCount}</span>
            </div>
            <p className={styles.metricSubtext}>
              {liveCount > 1 ? `${liveCount} personnes connectées` : '1 session active détectée'}
            </p>
          </div>

          {/* 2. Latency */}
          <div className={styles.metricCard}>
            <div className={styles.metricCardTop}>
              <span className={styles.metricLabel}>Latence Moyenne (P95)</span>
              <span className={`${styles.metricBadge} ${avgLat < 50 ? styles.badgeGood : styles.badgeWarning}`}>
                {avgLat < 50 ? 'Ultra Rapide' : 'Normal'}
              </span>
            </div>
            <div className={styles.metricValue}>
              {avgLat} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>ms</span>
            </div>
            <p className={styles.metricSubtext}>
              Percentile P95 : <strong>{p95Lat} ms</strong>
            </p>
          </div>

          {/* 3. Requests */}
          <div className={styles.metricCard}>
            <div className={styles.metricCardTop}>
              <span className={styles.metricLabel}>Requêtes Totales</span>
              <span className={`${styles.metricBadge} ${styles.badgeGood}`}>HTTP/1.1</span>
            </div>
            <div className={styles.metricValue}>{totalReq}</div>
            <p className={styles.metricSubtext}>
              2xx: {stats?.requestsByStatus?.['2xx'] || 0} • 4xx: {stats?.requestsByStatus?.['4xx'] || 0} • 5xx: {stats?.requestsByStatus?.['5xx'] || 0}
            </p>
          </div>

          {/* 4. Memory & Uptime */}
          <div className={styles.metricCard}>
            <div className={styles.metricCardTop}>
              <span className={styles.metricLabel}>Mémoire &amp; Uptime</span>
              <span className={`${styles.metricBadge} ${styles.badgeGood}`}>Node.js</span>
            </div>
            <div className={styles.metricValue}>
              {heapMb} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/ {heapTotalMb} Mo</span>
            </div>
            <p className={styles.metricSubtext}>
              Uptime serveur : <strong>{uptimeStr}</strong>
            </p>
          </div>
        </div>

        {/* Layout Split: Visitors & Requests */}
        <div className={styles.layoutSplit}>
          {/* Left: Active & Recent Visitors */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>
                <span>●</span> Sessions Visiteurs en Direct
              </h2>
              <span className={styles.panelCount}>
                {stats?.recentSessions?.length || 0} sessions
              </span>
            </div>

            <div className={styles.visitorsList}>
              {(!stats?.recentSessions || stats.recentSessions.length === 0) ? (
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>En attente de session...</p>
              ) : (
                stats.recentSessions.map((s) => (
                  <div
                    key={s.id}
                    className={`${styles.visitorItem} ${s.isOnline ? styles.visitorItemLive : ''}`}
                  >
                    <div className={styles.visitorTop}>
                      <div className={`${styles.visitorStatus} ${s.isOnline ? styles.visitorOnline : styles.visitorRecent}`}>
                        <span>{s.isOnline ? '🟢 En direct' : '○ Récemment actif'}</span>
                      </div>
                      <span className={styles.visitorIp}>{s.ip}</span>
                    </div>

                    <div className={styles.visitorMeta}>
                      <span className={styles.metaPill}>
                        🌍 {s.country}
                      </span>
                      <span className={styles.metaPill}>
                        💻 {s.device} • {s.browser} ({s.os})
                      </span>
                      <span className={styles.metaPill}>
                        👁️ {s.pageViews} requêtes
                      </span>
                    </div>

                    <div className={styles.visitorPath}>
                      <span>Section active :</span>
                      <strong>{s.currentPath || '/'}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Live Request Stream */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>
                <span>⚡</span> Flux des Requêtes HTTP (Live Log)
              </h2>
              <span className={styles.panelCount}>
                Dernières 15 requêtes
              </span>
            </div>

            <div className={styles.requestsList}>
              {(!stats?.recentRequests || stats.recentRequests.length === 0) ? (
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Aucune requête enregistrée.</p>
              ) : (
                stats.recentRequests.map((r) => {
                  const is2xx = r.status >= 200 && r.status < 300;
                  const is4xx = r.status >= 400 && r.status < 500;
                  const statusClass = is2xx ? styles.status2xx : (is4xx ? styles.status4xx : styles.status5xx);

                  return (
                    <div key={r.id} className={styles.reqItem}>
                      <div className={styles.reqLeft}>
                        <span className={r.method === 'POST' ? styles.methodPost : styles.methodGet}>
                          {r.method}
                        </span>
                        <span className={styles.reqUrl} title={r.url}>
                          {r.url}
                        </span>
                      </div>
                      <div className={styles.reqRight}>
                        <span className={statusClass}>
                          {r.status}
                        </span>
                        <span className={styles.reqDuration}>
                          {r.duration} ms
                        </span>
                        <span style={{ color: '#475569' }}>
                          {r.time}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Admin Controls Banner when authenticated */}
        {isAdmin && (
          <div className={styles.adminControls}>
            <div className={styles.adminStatusText}>
              ✓ Mode Administrateur vérifié — Vous visualisez les adresses IP réelles et pouvez réinitialiser les compteurs.
            </div>
            <button
              type="button"
              onClick={handleResetMetrics}
              className={styles.resetBtn}
            >
              Réinitialiser les métriques APM
            </button>
          </div>
        )}
      </div>

      {/* Admin Auth Modal */}
      {adminModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setAdminModalOpen(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Accès Administrateur APM</h3>
            <p className={styles.modalDesc}>
              Saisissez la clé ou le mot de passe administrateur pour démasquer les adresses IP et administrer la télémétrie.
            </p>

            <form onSubmit={handleAdminAuth} className={styles.modalForm}>
              {authError && (
                <p style={{ color: '#f87171', fontSize: '0.8rem', margin: '0 0 6px 0' }}>
                  {authError}
                </p>
              )}
              <input
                type="password"
                placeholder="Mot de passe admin (ex: mbarry@admin2026)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className={styles.modalInput}
                autoFocus
              />
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setAdminModalOpen(false)}
                  className={styles.btnCancel}
                >
                  Annuler
                </button>
                <button type="submit" className={styles.btnSubmit}>
                  Déverrouiller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Monitoring;
