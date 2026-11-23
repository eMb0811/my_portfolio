import { useState, useEffect } from 'react';
import styles from './BackToTop.module.css';

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 300);
    }

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <button
      onClick={scrollToTop}
      className={`${styles.button} ${visible ? styles.buttonVisible : ''}`}
      aria-label="Remonter en haut"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <span className={styles.arrow} aria-hidden="true">↑</span>
    </button>
  );
}

export default BackToTop;
