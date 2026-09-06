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

        {/* Availability Badge */}
        <div className={styles.statusBadge}>
          <span className={styles.statusDotWrapper}>
            <span className={styles.statusPing}></span>
            <span className={styles.statusDot}></span>
          </span>
          <span>Disponible pour stage &amp; alternance</span>
        </div>

        <button
          onClick={() => setMenuOuvert(!menuOuvert)}
          className={styles.toggle}
          aria-label="Menu de navigation"
        >
          {menuOuvert ? '✕' : 'Menu'}
        </button>

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
              <GitHubIcon size={20} />
            </a>

            <a
              href="https://www.linkedin.com/in/mouhamed-barry-043375259"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIcon}
              title="LinkedIn"
              aria-label="LinkedIn"
            >
              <LinkedInIcon size={20} />
            </a>

            <a
              href="#contact"
              onClick={() => setMenuOuvert(false)}
              className={styles.contactBtn}
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
