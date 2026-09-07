import styles from './Navbar.module.css';
import { useState } from 'react';
import { GitHubIcon, LinkedInIcon } from '../common/Icons.jsx';

const links = [
  { href: '#about', label: 'À propos' },
  { href: '#skills', label: 'Compétences' },
  { href: '#projects', label: 'Projets' },
  { href: '#contact', label: 'Contact' },
];

function Navbar() {
  const [menuOuvert, setMenuOuvert] = useState(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <a href="#home" className={styles.brand}>
          <span className={styles.brandTag}>&lt;/&gt;</span>
          <span>mouhamet<span className={styles.brandAccent}>.barry()</span></span>
        </a>

        {/* Availability Badge (shown only on wide desktop) */}
        <div className={styles.statusBadge}>
          <span className={styles.statusDotWrapper}>
            <span className={styles.statusPing}></span>
            <span className={styles.statusDot}></span>
          </span>
          <span>Disponible pour stage &amp; alternance</span>
        </div>

        {/* Mobile quick actions (visible < 1024px) */}
        <div className={styles.mobileControls}>
          <a href="#contact" className={styles.mobileContactBtn}>
            Me contacter
          </a>
          <button
            onClick={() => setMenuOuvert(!menuOuvert)}
            className={styles.toggle}
            aria-label={menuOuvert ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOuvert}
          >
            {menuOuvert ? (
              <svg className={styles.toggleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className={styles.toggleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Navigation links & desktop header buttons */}
        <div className={`${styles.navActions} ${menuOuvert ? styles.navActionsOpen : ''}`}>
          <ul className={styles.links}>
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setMenuOuvert(false)} className={styles.navLink}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className={styles.headerButtons}>
            <a
              href="https://github.com/eMb0811"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIcon}
              title="GitHub"
              aria-label="GitHub"
            >
              <GitHubIcon size={19} />
              <span className={styles.socialLabel}>GitHub</span>
            </a>

            <a
              href="https://www.linkedin.com/in/mouhamed-barry-043375259"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIcon}
              title="LinkedIn"
              aria-label="LinkedIn"
            >
              <LinkedInIcon size={19} />
              <span className={styles.socialLabel}>LinkedIn</span>
            </a>

            <a
              href="#contact"
              onClick={() => setMenuOuvert(false)}
              className={styles.desktopContactBtn}
            >
              Me contacter
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
