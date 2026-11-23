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
import { sendPing, initSectionTracking } from './utils/telemetry.js';

function App() {
  const [currentHash, setCurrentHash] = useState(() => window.location.hash);

  useEffect(() => {
    // Initial presence ping (only for public portfolio views)
    if (window.location.hash !== '#monitoring') {
      sendPing(window.location.hash || '/');
    }

    // Ping on hash change
    const handleHashChange = () => {
      const hash = window.location.hash;
      setCurrentHash(hash);
      if (hash !== '#monitoring') {
        sendPing(hash || '/');
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    // Automatic section tracking when scrolling
    let cleanupObserver = () => {};
    if (window.location.hash !== '#monitoring') {
      cleanupObserver = initSectionTracking();
    }

    // Heartbeat every 25 seconds while active on public portfolio
    const heartbeatInterval = setInterval(() => {
      if (window.location.hash !== '#monitoring') {
        sendPing(window.location.hash || '/');
      }
    }, 25000);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      cleanupObserver();
      clearInterval(heartbeatInterval);
    };
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
