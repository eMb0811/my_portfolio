import SkillItem from './SkillItem.jsx';
import { skills } from '../../data/skills.js';
import styles from './Skills.module.css';
import useReveal from '../../hooks/useReveal';

function Skills() {
   const [ref, visible] = useReveal();

   return (
      <section id="skills" ref={ref} className={`${styles.skills} reveal ${visible ? 'revealVisible' : ''}`}>
	<h2 className={styles.title}>Mes competences</h2>
	<ul className={styles.grid}>
	   {skills.map((skill) => <SkillItem key={skill.id} nom={skill.nom} niveau={skill.niveau} />
	   )}
	</ul>
      </section>
   );
}

export default Skills;
