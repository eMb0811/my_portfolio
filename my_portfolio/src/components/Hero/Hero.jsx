import styles from './Hero.module.css';
import useReveal from '../../hooks/useReveal.js';

function Hero() {
  const [ref, visible] = useReveal();
  return (
    <header id="home" ref={ref} className={`${styles.hero} reveal ${visible ? 'revealVisible' : ''}`}>
      <h1 className={styles.title}>Mouhamet Barry</h1>
      <h2 className={styles.subtitle}>Étudiant en Master 1 Réseaux, Télécommunications</h2>
      <p className={styles.text}>
        Passionné par la sécurité informatique, les réseaux et le développement
        web. Je conçois des solutions techniques modernes.
      </p>

      <div className={styles.actions}>
        <a href="#projects" className={`${styles.btn} ${styles.btnPrimary}`}>Voir mes projets</a>
        <a href="#contact" className={styles.btn}>Me contacter</a>
      </div>
    </header>
  );
}

export default Hero;
