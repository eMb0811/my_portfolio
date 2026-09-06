import styles from './Footer.module.css';
import useReveal from '../../hooks/useReveal.js';
import { GitHubIcon, LinkedInIcon } from '../common/Icons.jsx';

function Footer() {
  const [ref, visible] = useReveal();

  return (
    <footer
      ref={ref}
      className={`${styles.footer} reveal ${visible ? 'revealVisible' : ''}`}
    >
      <div className={styles.container}>
        <div className={styles.brandCol}>
          <span className={styles.brandCode}>&lt;/&gt;</span>
          <span className={styles.brandName}>mouhamet.barry()</span>
          <span className={styles.brandDesc}>— Ingénierie Cloud Native &amp; DevOps</span>
        </div>

        <div className={styles.links}>
          <a
            href="https://github.com/eMb0811"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
            title="GitHub"
          >
            <GitHubIcon size={16} />
            <span>GitHub</span>
          </a>
          <a
            href="https://www.linkedin.com/in/mouhamed-barry-043375259"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
            title="LinkedIn"
          >
            <LinkedInIcon size={16} />
            <span>LinkedIn</span>
          </a>
          <a href="mailto:elhadjibarry2001@gmail.com" className={styles.footerLink} title="Email">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Email</span>
          </a>
        </div>

        <p className={styles.copyright}>
          &copy; {new Date().getFullYear()} Mouhamet Barry. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}

export default Footer;

