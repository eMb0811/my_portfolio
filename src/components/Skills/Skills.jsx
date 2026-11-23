import { useState } from 'react';
import SkillItem from './SkillItem.jsx';
import { skills, categoriesSkills } from '../../data/skills.js';
import styles from './Skills.module.css';
import useReveal from '../../hooks/useReveal';

function Skills() {
  const [ref, visible] = useReveal();
  const [activeCategory, setActiveCategory] = useState(categoriesSkills[0]);

  const isAll = activeCategory === 'Tous';
  const filteredSkills = isAll
    ? skills
    : skills.filter((s) => s.categorie === activeCategory);

  const getCategoryCount = (cat) => {
    if (cat === 'Tous') return skills.length;
    return skills.filter((s) => s.categorie === cat).length;
  };

  return (
    <section id="skills" ref={ref} className={`${styles.skills} reveal ${visible ? 'revealVisible' : ''}`}>
      <div className={styles.header}>
        <div>
          <div className={styles.sectionBadge}>
            <span className={styles.badgeNum}>02.</span> STACK TECHNIQUE
          </div>
          <h2 className={styles.title}>Compétences &amp; Maîtrise Opérationnelle</h2>
        </div>
        <p className={styles.subtitle}>
          16 blocs de compétences éprouvés en laboratoires, projets académiques et déploiements réels — organisés par domaine d’expertise.
        </p>
      </div>

      <div className={styles.filters} role="tablist" aria-label="Filtrer les compétences par domaine">
        {categoriesSkills.map((cat) => {
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

      <ul className={`${styles.grid} ${isAll ? styles.gridAll : styles.gridDomain}`}>
        {filteredSkills.map((skill, index) => (
          <SkillItem
            key={`${activeCategory}-${skill.id}`}
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
