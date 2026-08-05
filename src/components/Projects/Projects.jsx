import { projects } from '../../data/projects.js';
import ProjectCard from './ProjectCard.jsx';
import styles from './Projects.module.css';
import useReveal from '../../hooks/useReveal.js';

function Projects() {
   const [ref, visible] = useReveal();
   return (
      <section id="projects" ref={ref} className={`${styles.projects} reveal ${visible ? 'revealVisible' : ''}`}>
	<h2 className={styles.title}>Mes projets</h2>
	<div className={styles.grid}>
	   {projects.map((project) => (
	      <ProjectCard
		key={project.id}
		titre={project.titre}
		description={project.description}
		tags={project.tags}
	      />
	   ))}
	</div>
      </section>   
   )
}

export default Projects ;
