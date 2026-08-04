import styles from './About.module.css';
import useReveal from '../../hooks/useReveal.js';

const parcours = [
  {
    id: 'm1',
    diplome: 'Master 1 – Réseaux, Télécommunications & Cybersécurité (RETEL)',
    etablissement: 'Université Cheikh Anta Diop de Dakar (en cours)',
  },
  {
    id: 'l3',
    diplome: 'Licence 3 Informatique',
    etablissement: 'Université Cheikh Anta Diop de Dakar',
  },
];

function About() {
  const [ref, visible] = useReveal();

  return (
    <section id="about" ref={ref} className={`${styles.about} reveal ${visible ? 'revealVisible' : ''}`}>
      <h2 className={styles.title}>À propos de moi</h2>
      <p className={styles.text}>
        Étudiant en Master 1, passionné par la sécurité informatique, les
        réseaux et le développement web. Je travaille actuellement sur une
        plateforme SIEM augmentée par l'IA générative pour le triage
        automatisé des alertes de sécurité.
      </p>
      <p className={styles.text}>
        Curieux et autonome, j'aime relever des défis techniques, que ce soit
        pour sécuriser une infrastructure réseau ou développer une application
        web moderne.
      </p>

      <h3 className={styles.subtitle}>Parcours universitaire</h3>
      <ul className={styles.parcours}>
        {parcours.map((etape) => (
          <li key={etape.id}>
            <strong>{etape.diplome}</strong> — {etape.etablissement}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default About;
