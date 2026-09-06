import { projects } from '../../data/projects.js';
import ProjectCard from './ProjectCard.jsx';
import styles from './Projects.module.css';
import useReveal from '../../hooks/useReveal.js';

function Projects() {
  const [ref, visible] = useReveal();

  return (
    <section id="projects" ref={ref} className={`${styles.projects} reveal ${visible ? 'revealVisible' : ''}`}>
      <div className={styles.header}>
        <div>
          <div className={styles.sectionBadge}>
            <span className={styles.badgeNum}>03.</span> RÉALISATIONS TECHNIQUES
          </div>
          <h2 className={styles.title}>Projets Cloud, DevOps &amp; Sécurité</h2>
        </div>
        <p className={styles.headerDesc}>
          Déploiements concrets axés sur l'automatisation, la robustesse opérationnelle et la traçabilité de bout en bout.
        </p>
      </div>

      <div className={styles.grid}>
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            id={project.id}
            titre={project.titre}
            description={project.description}
            tags={project.tags}
          />
        ))}
      </div>
    </section>
  );
}

export default Projects;

