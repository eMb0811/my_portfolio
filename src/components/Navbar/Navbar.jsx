import styles from './Navbar.module.css';
import { useState } from 'react';
const links = [
  { href: '#home', label: 'Accueil' },
  { href: '#about', label: 'À propos' },
  { href: '#skills', label: 'Compétences' },
  { href: '#projects', label: 'Projets' },
  { href: '#contact', label: 'Contact' },
];

function Navbar() {
   const [menuOuvert, setMenuOuvert] = useState(false);
   return (
      <nav className={styles.navbar}>
       <div className={styles.inner}>
	<a href="#home" className={styles.brand}>Mouhamet Barry</a>
	<button onClick={() => setMenuOuvert(!menuOuvert)} className={styles.toggle}>Menu</button>
	    <ul className={`${styles.links} ${menuOuvert ? styles.linksOpen : ''}`}>
	      {links.map((link) => (
		   <li key={link.href}>
			<a href={link.href} onClick={() => setMenuOuvert(false)}>{link.label}</a>
		   </li>
		))}
		</ul>
       </div>
      </nav>
   );
}
export default Navbar;
