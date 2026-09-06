import { useState } from 'react';
import styles from './Contact.module.css';
import useReveal from '../../hooks/useReveal.js';
import { GitHubIcon, LinkedInIcon } from '../common/Icons.jsx';

function Contact() {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [ref, visible] = useReveal();

  function handleSubmit(e) {
    e.preventDefault();
    alert(`Merci ${nom} ! Message envoyé (simulation).`);
    setNom('');
    setEmail('');
    setMessage('');
  }

  return (
    <section
      id="contact"
      ref={ref}
      className={`${styles.contact} reveal ${visible ? 'revealVisible' : ''}`}
    >
      <div className={styles.ambientGlow} />

      <div className={styles.card}>
        <div className={styles.cardGlow} />

        <div className={styles.header}>
          <div className={styles.sectionBadge}>
            <span className={styles.badgeNum}>04.</span> ENTRER EN CONTACT
          </div>
          <h2 className={styles.title}>
            Prêt à collaborer sur vos enjeux d'infrastructure ?
          </h2>
          <p className={styles.subtitle}>
            Recherche active d'une opportunité en stage de fin d'études ou alternance. N'hésitez pas à me laisser un message ou à m'écrire directement à{' '}
            <a href="mailto:elhadjibarry2001@gmail.com" className={styles.emailLink}>
              elhadjibarry2001@gmail.com
            </a>.
          </p>

          <div className={styles.socialStrip}>
            <a
              href="https://github.com/eMb0811"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialPill}
            >
              <GitHubIcon size={17} />
              <span>GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/mouhamed-barry-043375259"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialPill}
            >
              <LinkedInIcon size={17} />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="nom">Nom complet</label>
            <input
              id="nom"
              type="text"
              placeholder="Ex: Alexandre Dupont"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Adresse email</label>
            <input
              id="email"
              type="email"
              placeholder="alexandre@entreprise.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="message">Votre message</label>
            <textarea
              id="message"
              placeholder="Parlez-moi de vos besoins, d'un projet d'infrastructure ou d'une opportunité..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            <span>Envoyer le message</span>
            <svg className={styles.submitIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
      </div>
    </section>
  );
}

export default Contact;

