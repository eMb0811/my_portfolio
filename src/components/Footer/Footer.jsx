import styles from './Footer.module.css';
import useReveal from '../../hooks/useReveal.js';

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
          <a href="https://github.com/eMb0811" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/mouhamed-barry-043375259" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href="mailto:elhadjibarry2001@gmail.com">
            Email
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

