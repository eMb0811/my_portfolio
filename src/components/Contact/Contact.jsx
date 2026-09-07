import { useState } from 'react';
import styles from './Contact.module.css';
import useReveal from '../../hooks/useReveal.js';
import { GitHubIcon, LinkedInIcon } from '../common/Icons.jsx';

function Contact() {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [ref, visible] = useReveal();

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
      const apiEndpoint = baseUrl ? `${baseUrl}/api/contact` : '/api/contact';

      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nom, email, message }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de l'envoi de votre message.");
      }

      setStatus('success');
      setNom('');
      setEmail('');
      setMessage('');
    } catch (err) {
      console.error('Erreur contact:', err);
      setStatus('error');
      setErrorMessage(err.message || "Impossible d'envoyer votre message. Veuillez vérifier votre connexion ou m'écrire par email.");
    }
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

        {status === 'success' ? (
          <div className={styles.successCard}>
            <div className={styles.successIconWrapper}>
              <svg className={styles.successIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className={styles.successTitle}>Message envoyé avec succès !</h3>
            <p className={styles.successText}>
              Merci pour votre prise de contact. Votre email m'a été transmis directement et je vous répondrai dans les plus brefs délais.
            </p>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={() => setStatus('idle')}
            >
              Envoyer un autre message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {status === 'error' && (
              <div className={styles.errorBanner}>
                <svg className={styles.errorIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className={styles.errorContent}>
                  <strong>Erreur d'envoi</strong>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="nom">Nom complet</label>
              <input
                id="nom"
                type="text"
                placeholder="Ex: Alexandre Dupont"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                disabled={status === 'loading'}
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
                disabled={status === 'loading'}
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
                disabled={status === 'loading'}
              />
            </div>

            <button
              type="submit"
              className={`${styles.submitBtn} ${status === 'loading' ? styles.submitBtnLoading : ''}`}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <>
                  <span className={styles.spinner} />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <span>Envoyer le message</span>
                  <svg className={styles.submitIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export default Contact;

