import { useCallback, useMemo, useState } from 'react';
import { projects, categoriesProjects } from '../../data/projects.js';
import ProjectCard from './ProjectCard.jsx';
import ProjectDrawer from './ProjectDrawer.jsx';
import styles from './Projects.module.css';
import useReveal from '../../hooks/useReveal.js';
import { trackEvent } from '../../utils/telemetry.js';

function Projects() {
  const [ref, visible] = useReveal();
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [showAll, setShowAll] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // In "Tous", place the 6 flagship projects first for clean reading hierarchy
  const categoryProjects = useMemo(() => {
    if (activeCategory === 'Tous') {
      const featured = projects.filter((p) => p.featured);
      const others = projects.filter((p) => !p.featured);
      return [...featured, ...others];
    }
    return projects.filter((p) => p.categorie === activeCategory);
  }, [activeCategory]);

  const isAllTab = activeCategory === 'Tous';
  const featuredCount = useMemo(
    () => projects.filter((p) => p.featured).length,
    []
  );
  const hiddenCount = projects.length - featuredCount;

  const displayedProjects =
    isAllTab && !showAll
      ? categoryProjects.slice(0, featuredCount)
      : categoryProjects;

  const getCategoryCount = (cat) => {
    if (cat === 'Tous') return projects.length;
    return projects.filter((p) => p.categorie === cat).length;
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    if (cat !== 'Tous') {
      setShowAll(false);
    }
  };

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    trackEvent('PROJECT_VIEW', `Fiche projet : ${project.titre}`, {
      id: project.id,
      categorie: project.categorie,
    });
  };

  const handleCloseDrawer = useCallback(() => {
    setSelectedProject(null);
  }, []);

  const handleNavigateDrawer = useCallback((nextProject) => {
    setSelectedProject(nextProject);
  }, []);

  return (
    <section
      id="projects"
      ref={ref}
      className={`${styles.projects} reveal ${visible ? 'revealVisible' : ''}`}
    >
      <div className={styles.header}>
        <div>
          <div className={styles.sectionBadge}>
            <span className={styles.badgeNum}>03.</span> RÉALISATIONS &amp; ARCHITECTURES
          </div>
          <h2 className={styles.title}>Projets Cloud, DevSecOps, SOC &amp; Réseaux</h2>
        </div>
        <p className={styles.headerDesc}>
          13 projets et laboratoires d’ingénierie classés par domaine. Cliquez sur une carte pour explorer son architecture complète, ses choix techniques et ses liens.
        </p>
      </div>

      <div className={styles.filters} role="tablist" aria-label="Filtrer les projets par domaine">
        {categoriesProjects.map((cat) => {
          const isActive = activeCategory === cat;
          const count = getCategoryCount(cat);
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${styles.filterBtn} ${isActive ? styles.filterActive : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              <span>{cat}</span>
              <span className={styles.filterCount}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.grid}>
        {displayedProjects.map((project, index) => (
          <ProjectCard
            key={`${activeCategory}-${project.id}`}
            project={project}
            index={index}
            isVisible={visible}
            onSelect={handleSelectProject}
          />
        ))}
      </div>

      {isAllTab && hiddenCount > 0 && (
        <div className={styles.expandRow}>
          <span className={styles.expandLine} aria-hidden="true" />
          <button
            type="button"
            className={styles.expandBtn}
            onClick={() => setShowAll((prev) => !prev)}
            aria-expanded={showAll}
            aria-label={showAll ? 'Replier la liste des projets' : 'Déplier tous les projets'}
            title={showAll ? 'Replier' : 'Déplier'}
          >
            <svg
              className={`${styles.expandChevron} ${showAll ? styles.expandChevronUp : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <span className={styles.expandLine} aria-hidden="true" />
        </div>
      )}

      <ProjectDrawer
        project={selectedProject}
        projectsList={categoryProjects}
        onClose={handleCloseDrawer}
        onNavigate={handleNavigateDrawer}
      />
    </section>
  );
}

export default Projects;
