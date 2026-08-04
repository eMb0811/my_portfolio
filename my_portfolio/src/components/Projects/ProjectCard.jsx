import styles from './ProjectCard.module.css'

function ProjectCard({titre, description, tags}) {
   return (
      <div className={styles.card}>
	<h3 className={styles.titre}>{titre}</h3>
	<p className={styles.description}>{description}</p>
	<ul className={styles.tags}>
	   {tags.map((tag) => (
	      <li key={tag} className={styles.tag}>{tag}</li>
	 ))}
	</ul>
      </div>
   )
}

export default ProjectCard;
