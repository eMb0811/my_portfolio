import { useState } from 'react';
import styles from './Contact.module.css';
import useReveal from '../../hooks/useReveal.js';

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
      <h2 className={styles.title}>Me contacter</h2>
      <p className={styles.email}>elhadjibarry2001@gmail.com</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="nom">Nom complet</label>
          <input
            id="nom"
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>

        <button type="submit" className={styles.submit}>Envoyer le message</button>
      </form>
    </section>
  );
}

export default Contact;
