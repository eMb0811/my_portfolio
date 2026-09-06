import styles from './Hero.module.css';
import useReveal from '../../hooks/useReveal.js';

function Hero() {
  const [ref, visible] = useReveal();

  return (
    <header id="home" ref={ref} className={`${styles.hero} reveal ${visible ? 'revealVisible' : ''}`}>
      <div className={styles.ambientGlow} />

      <div className={styles.container}>
        {/* Role badge pill */}
        <div className={styles.roleBadge}>
          <span className={styles.badgePulse} />
          <span>Ingénierie Cloud &amp; DevOps • Sécurité SOC • Réseaux Télécoms</span>
        </div>

        {/* Headline */}
        <h1 className={styles.title}>
          Architecture Cloud Native, <br className={styles.breakLine} />
          <span className={styles.gradientText}>
            automatisation &amp; observabilité.
          </span>
        </h1>

        {/* Subtitle */}
        <p className={styles.text}>
          Étudiant en Master 1 Réseaux &amp; Télécommunications (UCAD).
          Je conçois et déploie des infrastructures résilientes, sécurisées et automatisées.
        </p>

        {/* CTAs */}
        <div className={styles.actions}>
          <a href="#projects" className={styles.primaryBtn}>
            <span>Explorer les projets</span>
            <svg className={styles.btnIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
          <a href="mailto:elhadjibarry2001@gmail.com" className={styles.secondaryBtn}>
            <svg className={styles.mailIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>elhadjibarry2001@gmail.com</span>
          </a>
        </div>

        {/* Tech tags strip */}
        <div className={styles.techStrip}>
          <span className={styles.techBadge}>Kubernetes</span>
          <span className={styles.techBadge}>Terraform</span>
          <span className={styles.techBadge}>Docker</span>
          <span className={styles.techBadge}>CI/CD GitOps</span>
          <span className={styles.techBadge}>Prometheus / Grafana</span>
          <span className={styles.techBadge}>Wazuh SIEM</span>
        </div>
      </div>
    </header>
  );
}

export default Hero;

