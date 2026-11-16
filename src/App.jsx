import { useState, useEffect } from 'react';
import Navbar from './components/Navbar/Navbar.jsx';
import Hero from './components/Hero/Hero.jsx';
import About from './components/About/About.jsx';
import Skills from './components/Skills/Skills.jsx';
import Projects from './components/Projects/Projects.jsx';
import Contact from './components/Contact/Contact.jsx';
import Footer from './components/Footer/Footer.jsx';
import BackToTop from './components/BackToTop/BackToTop.jsx';
import Monitoring from './components/Monitoring/Monitoring.jsx';

function App() {
  const [currentHash, setCurrentHash] = useState(() => window.location.hash);

  useEffect(() => {
    // Ping APM when hash or page changes
    const reportPresence = () => {
      setCurrentHash(window.location.hash);
      try {
        const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
        const pingUrl = baseUrl ? `${baseUrl}/api/monitor/ping` : '/api/monitor/ping';
        fetch(pingUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: window.location.hash || '/' }),
        }).catch(() => {});
      } catch {
        // ignore
      }
    };

    reportPresence();
    window.addEventListener('hashchange', reportPresence);
    return () => window.removeEventListener('hashchange', reportPresence);
  }, []);

  if (currentHash === '#monitoring') {
    return (
      <Monitoring
        onBack={() => {
          window.location.hash = '#home';
        }}
      />
    );
  }

  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Contact />
      <Footer />
      <BackToTop />
    </>
  );
}

export default App;
