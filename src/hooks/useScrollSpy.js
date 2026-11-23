import { useEffect, useState } from 'react';

const SECTION_IDS = ['home', 'about', 'skills', 'projects', 'contact'];

/**
 * Tracks page scroll progress (0..1) and the currently visible section ID
 * for the slim progress bar and Navbar active-link highlight.
 */
function useScrollSpy() {
  const [activeSection, setActiveSection] = useState('home');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let rafId = null;

    const update = () => {
      rafId = null;
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;
      setScrollProgress(progress);

      // Determine active section based on viewport anchor (30% from top)
      const anchor = scrollTop + window.innerHeight * 0.3;
      let current = 'home';

      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.offsetTop <= anchor) {
          current = id;
        }
      }

      // If scrolled near the very bottom, ensure the last section is active
      if (docHeight > 0 && scrollTop >= docHeight - 24) {
        current = SECTION_IDS[SECTION_IDS.length - 1];
      }

      setActiveSection(current);
    };

    const onScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return { activeSection, scrollProgress };
}

export default useScrollSpy;
