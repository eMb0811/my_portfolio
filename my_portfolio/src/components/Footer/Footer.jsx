import styles from './Footer.module.css';
import useReveal from '../../hooks/useReveal.js';

const reseaux = [
  { id: 'github', label: 'GitHub', url: 'https://github.com/eMb0811' },
  { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/mouhamed-barry-043375259' },
];

function Footer() {
  const [ref, visible] = useReveal();

  return (
    <footer
      ref={ref}
      className={`${styles.footer} reveal ${visible ? 'revealVisible' : ''}`}
    >
      <ul className={styles.links}>
        {reseaux.map((reseau) => (
          <li key={reseau.id}>
            <a href={reseau.url}>{reseau.label}</a>
          </li>
        ))}
      </ul>
      <p className={styles.copyright}>&copy; 2026 Mouhamet Barry. Tous droits réservés.</p>
    </footer>
  );
}

export default Footer;
