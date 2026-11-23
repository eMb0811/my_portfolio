import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './ProjectDrawer.module.css';
import { GitHubIcon } from '../common/Icons.jsx';
import { trackProjectClick } from '../../utils/telemetry.js';
import { getProjectIcon } from './projectIcons.jsx';

function ProjectDrawer({
  project,
  projectsList = [],
  onClose,
  onNavigate,
}) {
  const isOpen = Boolean(project);
  const [lastProject, setLastProject] = useState(project);
  const bodyRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Preserve the last opened project during the slide-out closing transition
  if (project && project !== lastProject) {
    setLastProject(project);
  }

  const activeProject = project || lastProject;
  const currentIndex = activeProject
    ? projectsList.findIndex((p) => p.id === activeProject.id)
    : -1;
  const totalCount = projectsList.length;

  const goPrev = useCallback(() => {
    if (totalCount <= 1 || currentIndex === -1) return;
    const prevIdx = (currentIndex - 1 + totalCount) % totalCount;
    onNavigate(projectsList[prevIdx]);
  }, [totalCount, currentIndex, projectsList, onNavigate]);

  const goNext = useCallback(() => {
    if (totalCount <= 1 || currentIndex === -1) return;
    const nextIdx = (currentIndex + 1) % totalCount;
    onNavigate(projectsList[nextIdx]);
  }, [totalCount, currentIndex, projectsList, onNavigate]);

  // Lock body scroll & keyboard navigation when drawer is open
  useEffect(() => {
    if (!isOpen) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = setTimeout(() => {
      closeBtnRef.current?.focus({ preventScroll: true });
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, goPrev, goNext]);

  // Reset scroll position to top when switching projects inside the drawer
  const activeProjectId = project?.id ?? null;
  useEffect(() => {
    if (bodyRef.current && activeProjectId) {
      bodyRef.current.scrollTop = 0;
    }
  }, [activeProjectId]);

  if (typeof document === 'undefined') return null;

  const displayIndex = currentIndex >= 0 ? String(currentIndex + 1).padStart(2, '0') : '--';
  const displayTotal = String(totalCount).padStart(2, '0');

  return createPortal(
    <div
      className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
      aria-hidden={!isOpen}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={activeProject ? activeProject.titre : 'Détails du projet'}
      >
        {/* Sticky Top Controls */}
        <div className={styles.topBar}>
          <div className={styles.navControls}>
            <span className={styles.counter} aria-live="polite">
              {displayIndex} <span className={styles.counterSep}>/</span> {displayTotal}
            </span>

            {totalCount > 1 && (
              <div className={styles.navButtons}>
                <button
                  type="button"
                  className={styles.navBtn}
                  onClick={goPrev}
                  title="Projet précédent (←)"
                  aria-label="Projet précédent"
                >
                  <svg className={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={styles.navBtn}
                  onClick={goNext}
                  title="Projet suivant (→)"
                  aria-label="Projet suivant"
                >
                  <svg className={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            title="Fermer (Échap)"
            aria-label="Fermer la fiche projet"
          >
            <svg className={styles.closeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div ref={bodyRef} className={styles.body}>
          {activeProject && (
            <div key={activeProject.id} className={styles.contentAnimated}>
              <div className={styles.metaRow}>
                <span className={styles.iconBox}>
                  {getProjectIcon(activeProject.id, activeProject.categorie, styles.iconSvg)}
                </span>
                <div className={styles.metaBadges}>
                  {activeProject.badgeContexte && (
                    <span className={styles.contextBadge}>{activeProject.badgeContexte}</span>
                  )}
                  {activeProject.categorie && (
                    <span className={styles.domainPill}>{activeProject.categorie}</span>
                  )}
                </div>
              </div>

              <h3 className={styles.title}>{activeProject.titre}</h3>
              <p className={styles.description}>{activeProject.description}</p>

              {activeProject.highlights && activeProject.highlights.length > 0 && (
                <div className={styles.section}>
                  <h4 className={styles.sectionHeading}>
                    Points clés d’architecture &amp; réalisations
                  </h4>
                  <ul className={styles.highlightsList}>
                    {activeProject.highlights.map((item, idx) => (
                      <li key={idx} className={styles.highlightCard}>
                        <span className={styles.highlightNum} aria-hidden="true">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className={styles.highlightText}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeProject.tags && activeProject.tags.length > 0 && (
                <div className={styles.section}>
                  <h4 className={styles.sectionHeading}>
                    Stack &amp; technologies ({activeProject.tags.length})
                  </h4>
                  <div className={styles.tagsContainer}>
                    {activeProject.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Footer Actions */}
        {activeProject && (
          <div className={styles.footer}>
            <div className={styles.footerActions}>
              <a
                href={activeProject.githubUrl || 'https://github.com/eMb0811'}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.actionBtn}
                onClick={() =>
                  trackProjectClick(activeProject.titre, 'GitHub (Drawer)', activeProject.githubUrl)
                }
              >
                <GitHubIcon size={16} />
                <span>Code &amp; Doc GitHub</span>
              </a>

              {activeProject.liveUrl && (
                <a
                  href={activeProject.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.actionBtn} ${styles.actionBtnLive}`}
                  onClick={() =>
                    trackProjectClick(activeProject.titre, 'Démo Live (Drawer)', activeProject.liveUrl)
                  }
                >
                  <svg className={styles.liveIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Ouvrir la démo live</span>
                </a>
              )}
            </div>
            <div className={styles.keyboardHint} aria-hidden="true">
              <span>← → naviguer</span>
              <span>·</span>
              <span>Échap fermer</span>
            </div>
          </div>
        )}
      </aside>
    </div>,
    document.body
  );
}

export default ProjectDrawer;
