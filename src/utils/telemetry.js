/**
 * Telemetry and APM Client Tracking Utility
 * Handles visitor presence, live section observation, and high-value event tracking
 */

export function getApiUrl(endpoint) {
  if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
    const cleanEndpoint = endpoint.replace(/^\/?(my_portfolio\/)?api\//, '');
    return `https://mbarry.is-a.dev/api/${cleanEndpoint}`;
  }
  const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  return baseUrl ? `${baseUrl}${endpoint}` : endpoint;
}

/**
 * Ping visitor session with current active path/section
 */
export async function sendPing(path) {
  try {
    const url = getApiUrl('/api/monitor/ping');
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: path || window.location.hash || '/' }),
    });
  } catch {
    // Silent fail in dev or offline
  }
}

/**
 * Track an interaction event (CV download, project demo, contact click)
 */
export async function trackEvent(event, label, details = null) {
  try {
    const url = getApiUrl('/api/monitor/event');
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, label, details }),
    });
  } catch {
    // Silent fail
  }
}

/**
 * Track CV download click
 */
export function trackCvDownload(source = 'Bouton') {
  trackEvent('CV_DOWNLOAD', `Téléchargement CV (${source})`, { source, timestamp: Date.now() });
}

/**
 * Track project link click (GitHub repo or live demo)
 */
export function trackProjectClick(projectTitle, linkType, url) {
  trackEvent('PROJECT_CLICK', `${projectTitle} [${linkType}]`, { projectTitle, linkType, url });
}

/**
 * Track contact channel interaction
 */
export function trackContactClick(channel) {
  trackEvent('CONTACT_CLICK', `Prise de contact (${channel})`, { channel });
}

/**
 * Automatically observe sections as the visitor scrolls and send pings
 */
export function initSectionTracking(onSectionChange) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return () => {};
  }

  const sectionIds = ['home', 'about', 'skills', 'projects', 'contact'];
  let currentSection = '';
  let timeoutId = null;

  const observer = new IntersectionObserver(
    (entries) => {
      // Find the entry that has the highest intersection ratio
      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length === 0) return;

      visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      const topSection = visible[0].target.id;

      if (topSection && topSection !== currentSection) {
        currentSection = topSection;
        if (onSectionChange) onSectionChange(topSection);

        // Debounce ping to avoid spamming on fast scrolling
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          sendPing(`#${topSection}`);
        }, 1200);
      }
    },
    {
      root: null,
      rootMargin: '-20% 0px -40% 0px',
      threshold: [0.2, 0.5, 0.8],
    }
  );

  sectionIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });

  return () => {
    clearTimeout(timeoutId);
    observer.disconnect();
  };
}
