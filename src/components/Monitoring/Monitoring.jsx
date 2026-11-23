import { useState, useEffect, useCallback } from 'react';
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

function getApiUrl(endpoint) {
  if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
    return `https://mbarry.is-a.dev/api/${endpoint.replace(/^\/?(my_portfolio\/)?api\//, '')}`;
  }
  const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  return baseUrl ? `${baseUrl}${endpoint}` : endpoint;
}

function Monitoring({ onBack }) {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('apm_admin_token') || '');
  const [stats, setStats] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(() => Boolean(localStorage.getItem('apm_admin_token')));
  const [submitting, setSubmitting] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [expandedSessions, setExpandedSessions] = useState(() => new Set());
  const [discordFeedback, setDiscordFeedback] = useState('');

  const toggleExpand = (id) => {
    setExpandedSessions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const fetchStats = useCallback(async (tokenToUse) => {
    if (!tokenToUse) {
      setStats(null);
      setCheckingAuth(false);
      return;
    }

    try {
      const url = getApiUrl('/api/monitor/stats');
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('apm_admin_token');
        setAdminToken('');
        setStats(null);
        setAuthError('Session administrateur expirée. Veuillez vous authentifier.');
        setCheckingAuth(false);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setCheckingAuth(false);
      }
    } catch (err) {
      console.warn('APM Fetch warning:', err.message);
      setCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    if (!adminToken) {
      return;
    }

    let isMounted = true;

    async function poll() {
      if (!isMounted) return;
      await fetchStats(adminToken);
    }

    poll();
    const intervalStats = setInterval(poll, 3000);

    return () => {
      isMounted = false;
      clearInterval(intervalStats);
    };
  }, [adminToken, fetchStats]);

  async function handleAdminAuth(e) {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    setAuthError('');
    setSubmitting(true);

    try {
      const url = getApiUrl('/api/monitor/auth');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Mot de passe invalide.');
      }

      localStorage.setItem('apm_admin_token', data.token);
      setAdminToken(data.token);
      setPasswordInput('');
      setCheckingAuth(true);
      await fetchStats(data.token);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    try {
      if (adminToken) {
        await fetch(getApiUrl('/api/monitor/logout'), {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      }
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem('apm_admin_token');
    setAdminToken('');
    setStats(null);
    setAuthError('');
  }

  async function handleTestDiscord() {
    setDiscordFeedback('Envoi du test Discord...');
    try {
      const url = getApiUrl('/api/monitor/test-discord');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setDiscordFeedback('✅ ' + (data.message || 'Alerte test envoyée sur Discord !'));
      } else {
        setDiscordFeedback('❌ ' + (data.error || `Erreur HTTP ${res.status}`));
      }
    } catch (err) {
      setDiscordFeedback('❌ Erreur réseau : ' + err.message);
    }
  }

  async function handleResetMetrics() {
    if (!window.confirm('Voulez-vous réinitialiser les compteurs de requêtes et de latence APM ?')) {
      return;
    }

    try {
      const url = getApiUrl('/api/monitor/reset');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      if (res.ok) {
        await fetchStats(adminToken);
      }
    } catch (err) {
      alert('Erreur lors du reset : ' + err.message);
    }
  }

  const isAuthenticated = Boolean(adminToken && stats && stats.isAdmin);

  // Strict Private Admin Gate (blocks ALL telemetry UI if not authenticated)
  if (!isAuthenticated) {
    return (
      <div className={styles.monitoringContainer}>
        <div className={styles.ambientGlow} />

        <div className={styles.inner}>
          <div className={styles.authGateWrapper}>
            <div className={styles.authGateCard}>
              <div className={styles.authLockIcon}>
                <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>

              <span className={styles.authBadge}>ACCÈS PRIVÉ • ADMIN UNIQUEMENT</span>

              <h1 className={styles.authGateTitle}>Console APM &amp; Monitoring</h1>

              {checkingAuth ? (
                <p className={styles.authGateSubtitle}>
                  Vérification de votre session administrateur en cours...
                </p>
              ) : (
                <>
                  <p className={styles.authGateSubtitle}>
                    Cet espace de télémétrie et de suivi visiteurs est strictement réservé à l’administrateur du portfolio.
                  </p>

                  <form onSubmit={handleAdminAuth} className={styles.authGateForm}>
                    {authError && <div className={styles.authErrorBox}>{authError}</div>}

                    <input
                      type="password"
                      autoComplete="current-password"
                      placeholder="Mot de passe administrateur"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className={styles.authInput}
                      autoFocus
                      required
                    />

                    <button
                      type="submit"
                      className={styles.authSubmitBtn}
                      disabled={submitting}
                    >
                      {submitting ? 'Vérification...' : 'Déverrouiller le Monitoring'}
                    </button>
                  </form>
                </>
              )}

              <button type="button" onClick={onBack} className={styles.authBackLink}>
                ← Retour au Portfolio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const liveCount = stats?.liveVisitorsCount || 0;
  const avgLat = stats?.avgLatency || 0;
  const p95Lat = stats?.p95Latency || 0;
  const totalReq = stats?.totalRequests || 0;
  const heapMb = stats?.memory?.heapUsedMb || 0;
  const heapTotalMb = stats?.memory?.heapTotalMb || 0;
  const uptimeStr = formatUptime(stats?.uptimeSeconds || 0);

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

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className={`${styles.adminBtn} ${styles.adminBtnUnlocked}`}>
              🔓 Espace Privé Admin
            </span>
            <button type="button" onClick={handleLogout} className={styles.backBtn} title="Verrouiller et se déconnecter">
              Déconnexion
            </button>
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
              {liveCount > 1
                ? `${liveCount} personnes connectées`
                : liveCount === 1
                  ? '1 session active détectée'
                  : 'Aucun visiteur en direct'}
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
                stats.recentSessions.map((s) => {
                  const isExpanded = expandedSessions.has(s.id);

                  return (
                    <div
                      key={s.id}
                      className={`${styles.visitorItem} ${s.isOnline ? styles.visitorItemLive : ''}`}
                    >
                      {/* Top Header */}
                      <div className={styles.visitorTop}>
                        <div className={`${styles.visitorStatus} ${s.isOnline ? styles.visitorOnline : styles.visitorRecent}`}>
                          <span>{s.isOnline ? '🟢 En direct' : '○ Récemment actif'}</span>
                        </div>
                        <span className={styles.visitorIp}>{s.ip}</span>
                      </div>

                      {/* Action Badges (CV, Projects, Contact) */}
                      {s.actions && s.actions.length > 0 && (
                        <div className={styles.actionBadgesRow}>
                          {s.actions.includes('CV_DOWNLOAD') && (
                            <span className={`${styles.actionBadge} ${styles.actionBadgeCv}`}>
                              📄 CV Téléchargé
                            </span>
                          )}
                          {s.actions.includes('PROJECT_CLICK') && (
                            <span className={`${styles.actionBadge} ${styles.actionBadgeProject}`}>
                              🚀 Projet Exploré
                            </span>
                          )}
                          {s.actions.includes('CONTACT_CLICK') && (
                            <span className={`${styles.actionBadge} ${styles.actionBadgeContact}`}>
                              📬 Contact Cliqué
                            </span>
                          )}
                          {s.actions.includes('CONTACT_FORM_SUBMIT') && (
                            <span className={`${styles.actionBadge} ${styles.actionBadgeCv}`}>
                              ✉️ Formulaire Envoyé
                            </span>
                          )}
                        </div>
                      )}

                      {/* Exact Arrival Date & Time + Duration */}
                      <div className={styles.visitorArrivalRow}>
                        <span className={styles.arrivalDate}>
                          🕒 Arrivé le : <strong>{s.firstSeenFormatted || (s.firstSeen ? new Date(s.firstSeen).toLocaleString('fr-FR') : 'N/A')}</strong>
                        </span>
                        <span className={styles.arrivalDuration}>
                          {s.isOnline ? '⏱️ Session en direct' : `⏱️ Durée : ${formatUptime(s.durationSeconds || 0)}`}
                        </span>
                      </div>

                      {/* Visitor Device & Location Meta */}
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

                      {/* Active Section */}
                      <div className={styles.visitorPath}>
                        <span>Section active :</span>
                        <strong>{s.currentPath || '/'}</strong>
                      </div>

                      {/* Collapsible Visitor Journey Timeline */}
                      {s.timeline && s.timeline.length > 0 && (
                        <>
                          <button
                            type="button"
                            className={styles.timelineToggleBtn}
                            onClick={() => toggleExpand(s.id)}
                            title="Afficher ou masquer la chronologie des sections et actions"
                          >
                            <span>🧭 Parcours du visiteur ({s.timeline.length} étape{s.timeline.length > 1 ? 's' : ''})</span>
                            <span>{isExpanded ? '▲ Masquer' : '▼ Dérouler'}</span>
                          </button>

                          {isExpanded && (
                            <div className={styles.timelineWrapper}>
                              <div className={styles.timelineHeader}>Historique de navigation</div>
                              <div className={styles.timelineList}>
                                {s.timeline.map((step, idx) => {
                                  let dotClass = styles.timelineDot;
                                  if (step.type === 'action') {
                                    if (step.actionType === 'CV_DOWNLOAD') dotClass = `${styles.timelineDot} ${styles.timelineDotCv}`;
                                    else if (step.actionType === 'PROJECT_CLICK') dotClass = `${styles.timelineDot} ${styles.timelineDotProject}`;
                                    else if (step.actionType === 'CONTACT_CLICK') dotClass = `${styles.timelineDot} ${styles.timelineDotContact}`;
                                  } else if (step.type === 'section') {
                                    dotClass = `${styles.timelineDot} ${styles.timelineDotSection}`;
                                  }

                                  return (
                                    <div key={step.id || `${step.time}-${idx}`} className={styles.timelineStep}>
                                      <div className={dotClass} />
                                      <div className={styles.timelineStepContent}>
                                        <div className={styles.timelineStepHeader}>
                                          <span className={styles.timelineStepName}>{step.name}</span>
                                          <span className={styles.timelineStepTime}>{step.time}</span>
                                        </div>
                                        {step.details?.url && (
                                          <span className={styles.timelineStepDetails}>
                                            Lien : {step.details.url}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })
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

        {/* Admin Controls Banner */}
        <div className={styles.adminControls}>
          <div className={styles.adminStatusText}>
            ✓ Accès Administrateur Privé — Les statistiques APM et IP visiteurs sont strictement protégées côté serveur (HTTP 401 sans authentification).
            {discordFeedback && (
              <div style={{ marginTop: '6px', color: discordFeedback.startsWith('✅') ? '#34d399' : '#fca5a5' }}>
                {discordFeedback}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleTestDiscord}
              className={styles.adminBtn}
            >
              🔔 Tester Discord
            </button>
            <button
              type="button"
              onClick={handleResetMetrics}
              className={styles.resetBtn}
            >
              Réinitialiser les métriques APM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Monitoring;
