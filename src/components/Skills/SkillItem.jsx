import { useEffect, useState } from 'react';
import styles from './SkillItem.module.css';
import { handleSpotlightMove } from '../../utils/spotlight.js';

const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ~163.36

function SkillItem({ nom, statut, tags = [], pourcentage = 0, isVisible = true, index = 0 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      return undefined;
    }

    let start = 0;
    let timer = null;
    const duration = 1100;
    const steps = 30;
    const increment = pourcentage / steps;
    const intervalTime = duration / steps;

    const delayTimeout = setTimeout(() => {
      timer = setInterval(() => {
        start += increment;
        if (start >= pourcentage) {
          setCount(pourcentage);
          clearInterval(timer);
          timer = null;
        } else {
          setCount(Math.round(start));
        }
      }, intervalTime);
    }, Math.min(index * 40, 300));

    return () => {
      clearTimeout(delayTimeout);
      if (timer) clearInterval(timer);
    };
  }, [isVisible, pourcentage, index]);

  const strokeOffset = isVisible
    ? CIRCUMFERENCE - (CIRCUMFERENCE * (pourcentage / 100))
    : CIRCUMFERENCE;

  return (
    <li
      className={`${styles.card} spotlightCard ${isVisible ? 'filterEnter' : ''}`}
      style={{ '--enter-delay': `${Math.min(index * 30, 240)}ms` }}
      onMouseMove={handleSpotlightMove}
    >
      <div className={styles.info}>
        <div className={styles.titleRow}>
          <h3 className={styles.nom}>{nom}</h3>
          {statut && (
            <span className={`${styles.statutBadge} ${statut === 'Opérationnel' ? styles.badgeOperationnel : styles.badgePratique}`}>
              <span className={styles.dot}>●</span> {statut}
            </span>
          )}
        </div>

        {tags && tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.gaugeContainer} title={`${nom} : ${statut} (${pourcentage}%)`}>
        <svg className={styles.svgGauge} viewBox="0 0 64 64" aria-hidden="true">
          <circle
            className={styles.gaugeBg}
            cx="32"
            cy="32"
            r={RADIUS}
          />
          <circle
            className={`${styles.gaugeProgress} ${statut === 'Pratique' ? styles.gaugePratique : ''}`}
            cx="32"
            cy="32"
            r={RADIUS}
            style={{
              strokeDashoffset: strokeOffset,
              transitionDelay: `${index * 50}ms`,
            }}
          />
        </svg>
        <div className={styles.gaugeValue}>
          <span className={styles.countText}>{isVisible ? count : 0}</span>
          <span className={styles.percentSymbol}>%</span>
        </div>
      </div>
    </li>
  );
}

export default SkillItem;


