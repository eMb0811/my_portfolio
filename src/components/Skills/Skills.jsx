import { useState } from 'react';
import SkillItem from './SkillItem.jsx';
import { skills, categoriesSkills } from '../../data/skills.js';
import styles from './Skills.module.css';
import useReveal from '../../hooks/useReveal';

function Skills() {
  const [ref, visible] = useReveal();
  const [activeCategory, setActiveCategory] = useState('Tous');

  const filteredSkills = activeCategory === 'Tous'
    ? skills
    : skills.filter((s) => s.categorie === activeCategory);

  return (
    <section id="skills" ref={ref} className={`${styles.skills} reveal ${visible ? 'revealVisible' : ''}`}>
      <h2 className={styles.title}>Mes compétences</h2>

      <div className={styles.filters}>
        {categoriesSkills.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterActive : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <ul className={styles.grid}>
        {filteredSkills.map((skill, index) => (
          <SkillItem
            key={skill.id}
            nom={skill.nom}
            statut={skill.statut}
            tags={skill.tags}
            pourcentage={skill.pourcentage}
            isVisible={visible}
            index={index}
          />
        ))}
      </ul>
    </section>
  );
}

export default Skills;

