import styles from './SkillItem.module.css';

function SkillItem({ nom, niveau }) {
   const barres = Array.from({ length: 5});

   return (
      <li className={styles.card}>
	<p className={styles.nom}>{nom}</p>
        <div className={styles.bars}>
	   {barres.map((_, index) => (
	      <span
	         key={index}
		 className={`${styles.bar} ${index < niveau ? styles.barFilled: ''}`}
	      />
	    ))}
	</div>
      </li>
   );
}

export default SkillItem;
