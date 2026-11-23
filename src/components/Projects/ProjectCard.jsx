import styles from './ProjectCard.module.css';
import { GitHubIcon } from '../common/Icons.jsx';
import { trackProjectClick } from '../../utils/telemetry.js';
import { handleSpotlightMove } from '../../utils/spotlight.js';
import { getProjectIcon } from './projectIcons.jsx';

const MAX_VISIBLE_TAGS = 4;

function ProjectCard({
  project,
  index = 0,
  isVisible = true,
  onSelect,
}) {
  const {
    id,
    titre,
    categorie,
    badgeContexte,
    description,
    tags = [],
    githubUrl = 'https://github.com/eMb0811',
    liveUrl,
  } = project;

  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const remainingTagsCount = Math.max(tags.length - MAX_VISIBLE_TAGS, 0);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(project);
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Ouvrir les détails techniques de ${titre}`}
      className={`${styles.card} spotlightCard ${isVisible ? 'filterEnter' : ''}`}
      style={{ '--enter-delay': `${Math.min(index * 45, 270)}ms` }}
      onClick={() => onSelect(project)}
      onKeyDown={handleKeyDown}
      onMouseMove={handleSpotlightMove}
    >
      <div className={styles.cardTop}>
        <div className={styles.headerRow}>
          <div className={styles.iconAndBadge}>
            <span className={styles.iconBox}>
              {getProjectIcon(id, categorie, styles.iconSvg)}
            </span>
            {badgeContexte && (
              <span className={styles.contextBadge}>{badgeContexte}</span>
            )}
          </div>
          {liveUrl && (
            <span className={styles.liveDotBadge} title="Démo en ligne disponible">
              <span className={styles.liveDot} aria-hidden="true" />
              Live
            </span>
          )}
        </div>

        <h3 className={styles.titre}>{titre}</h3>
        <p className={styles.description}>{description}</p>
      </div>

      <div className={styles.cardBottom}>
        <div className={styles.tagsContainer}>
          {visibleTags.map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
          {remainingTagsCount > 0 && (
            <span className={styles.tagMore} title={`${remainingTagsCount} technologies supplémentaires dans la fiche`}>
              +{remainingTagsCount}
            </span>
          )}
        </div>

        <div className={styles.cardFooter}>
          <span className={styles.detailsPrompt}>
            <span>Détails techniques</span>
            <svg className={styles.arrowIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>

          <div className={styles.quickLinks}>
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.quickIconBtn}
              title="Code & Doc GitHub"
              aria-label={`Ouvrir ${titre} sur GitHub`}
              onClick={(e) => {
                e.stopPropagation();
                trackProjectClick(titre, 'GitHub', githubUrl);
              }}
            >
              <GitHubIcon size={15} />
            </a>

            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.quickIconBtn} ${styles.quickIconBtnLive}`}
                title="Ouvrir la démo live"
                aria-label={`Ouvrir la démo live de ${titre}`}
                onClick={(e) => {
                  e.stopPropagation();
                  trackProjectClick(titre, 'Démo Live', liveUrl);
                }}
              >
                <svg className={styles.liveIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProjectCard;
