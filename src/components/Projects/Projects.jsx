import { useState } from 'react';
import { projects, categoriesProjects } from '../../data/projects.js';
import ProjectCard from './ProjectCard.jsx';
import styles from './Projects.module.css';
import useReveal from '../../hooks/useReveal.js';

function Projects() {
  const [ref, visible] = useReveal();
  const [activeCategory, setActiveCategory] = useState('Tous');

  const filteredProjects =
    activeCategory === 'Tous'
      ? projects
      : projects.filter((p) => p.categorie === activeCategory);

  const getCategoryCount = (cat) => {
    if (cat === 'Tous') return projects.length;
    return projects.filter((p) => p.categorie === cat).length;
  };

  return (
    <section id="projects" ref={ref} className={`${styles.projects} reveal ${visible ? 'revealVisible' : ''}`}>
      <div className={styles.header}>
        <div>
          <div className={styles.sectionBadge}>
            <span className={styles.badgeNum}>03.</span> RÉALISATIONS &amp; ARCHITECTURES
          </div>
          <h2 className={styles.title}>Projets Cloud, DevSecOps, SOC &amp; Réseaux</h2>
        </div>
        <p className={styles.headerDesc}>
          13 projets et laboratoires d’ingénierie complets (code source, IaC, playbooks, dashboards et rapports techniques) classés par domaine d’expertise.
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
              onClick={() => setActiveCategory(cat)}
            >
              <span>{cat}</span>
              <span className={styles.filterCount}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.grid}>
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            id={project.id}
            titre={project.titre}
            categorie={project.categorie}
            badgeContexte={project.badgeContexte}
            description={project.description}
            highlights={project.highlights}
            tags={project.tags}
            githubUrl={project.githubUrl}
            liveUrl={project.liveUrl}
          />
        ))}
      </div>
    </section>
  );
}

export default Projects;
