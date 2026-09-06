import styles from './About.module.css';
import useReveal from '../../hooks/useReveal.js';
import photoMb from '../../assets/photo_mb.jpg';
import { GitHubIcon, LinkedInIcon } from '../common/Icons.jsx';

const parcours = [
  {
    id: 'm1',
    diplome: 'Master 1 – Réseaux et Télécommunications (RETEL)',
    etablissement: 'Faculté des Sciences et Techniques – Université Cheikh Anta Diop de Dakar (en cours)',
    details: 'Approfondissement en architectures réseaux avancées, sécurité des infrastructures, virtualisation, protocoles télécoms et gestion des systèmes distribués.',
  },
  {
    id: 'l3',
    diplome: 'Licence 3 – Informatique',
    etablissement: 'Faculté des Sciences et Techniques – Université Cheikh Anta Diop de Dakar',
    details: 'Fondamentaux des systèmes d\'exploitation (Linux), algorithmique, programmation orientée objet (Java, Python), bases de données relationnelles et génie logiciel.',
  },
];

const piliers = [
  {
    id: 'cloud-native',
    titre: 'Cloud Native & Orchestration',
    description: 'Déploiement et gestion d\'applications distribuées avec Kubernetes (pods, ingress, services, volumes) et conteneurisation multi-stage optimisée via Docker.',
  },
  {
    id: 'devops-cicd',
    titre: 'DevOps & Industrialisation CI/CD',
    description: 'Automatisation complète du cycle de livraison continue via GitHub Actions, intégration de tests, build et publication vers des registres de conteneurs (GHCR).',
  },
  {
    id: 'cloud-iac',
    titre: 'Cloud (AWS) & IaC',
    description: 'Conception d\'infrastructures résilientes sur Amazon Web Services (EC2, VPC, Security Groups) et automatisation du provisioning avec Terraform.',
  },
  {
    id: 'soc-securite',
    titre: 'Sécurité, SOC & Supervision',
    description: 'Centralisation de logs Linux avec RSyslog, corrélation et détection d\'intrusions via le SIEM Wazuh, combinées à des scripts Python d\'analyse automatisée.',
  },
];

function About() {
  const [ref, visible] = useReveal();

  return (
    <section id="about" ref={ref} className={`${styles.about} reveal ${visible ? 'revealVisible' : ''}`}>
      <div className={styles.aboutLayout}>
        {/* Left Profile Card (Stitch Inspired with real photo) */}
        <div className={styles.profileWrapper}>
          <div className={styles.profileGlow}></div>
          <div className={styles.profileCard}>
            <div className={styles.avatarContainer}>
              <img src={photoMb} alt="Mouhamet Barry" className={styles.avatarImg} />
            </div>

            <h3 className={styles.profileName}>Mouhamet Barry</h3>
            <p className={styles.profileRole}>Master 1 RETEL • Cloud &amp; DevOps</p>

            <div className={styles.metaList}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Localisation :</span>
                <span className={styles.metaValue}>Dakar / Remote</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Formation :</span>
                <span className={styles.metaValue}>Master 1 RETEL (UCAD)</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Spécialité :</span>
                <span className={styles.metaValue}>Kubernetes, Docker, CI/CD</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Statut :</span>
                <span className={styles.metaStatus}>
                  <span className={styles.statusDot}></span> En recherche de stage
                </span>
              </div>
            </div>

            <div className={styles.profileSocials}>
              <a
                href="https://github.com/eMb0811"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.profileSocialBtn}
                title="Profil GitHub"
              >
                <GitHubIcon size={17} />
                <span>GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/mouhamed-barry-043375259"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.profileSocialBtn}
                title="Profil LinkedIn"
              >
                <LinkedInIcon size={17} />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Main Content */}
        <div className={styles.mainContent}>
          <div className={styles.sectionBadge}>
            <span className={styles.badgeNum}>01.</span> APERÇU &amp; PROFIL
          </div>
          <h2 className={styles.title}>
            Concevoir des infrastructures Cloud Native résilientes et automatisées.
          </h2>

          <div className={styles.content}>
            <p className={styles.text}>
              Actuellement étudiant en Master 1 Réseaux et Télécommunications (RETEL) à l'Université
              Cheikh Anta Diop de Dakar (UCAD) et titulaire d'une Licence en Informatique,
              j'ai orienté mon apprentissage vers l'ingénierie Cloud, le DevOps et
              l'industrialisation des infrastructures modernes.
            </p>

            <p className={styles.text}>
              Passionné par l'écosystème Cloud Native, je concentre mes réalisations sur la conteneurisation
              avec Docker et l'orchestration sous Kubernetes. J'automatise le cycle de vie
              logiciel grâce à des pipelines CI/CD robustes avec GitHub Actions, permettant des déploiements
              reproductibles, sécurisés et sans friction, tant sur des serveurs dédiés que dans des environnements Cloud (AWS).
            </p>

            <p className={styles.text}>
              Sur le plan de la cybersécurité et de la supervision, j'ai élaboré des architectures de collecte
              et d'analyse de journaux système sous Linux exploitant RSyslog et la solution SIEM Wazuh,
              tout en développant des scripts Python pour l'extraction et l'analyse automatisée de télémétrie.
              Côté développement, j'ai conçu des services web RESTful d'entreprise en Java (JAX-RS / Jakarta EE) ainsi que
              des projets mobiles Android.
            </p>
          </div>

          <h3 className={styles.subtitle}>Piliers techniques &amp; Cloud Native</h3>
          <div className={styles.piliersGrid}>
            {piliers.map((p) => (
              <div key={p.id} className={styles.pilierCard}>
                <h4 className={styles.pilierTitle}>{p.titre}</h4>
                <p className={styles.pilierDesc}>{p.description}</p>
              </div>
            ))}
          </div>

          <h3 className={styles.subtitle}>Parcours universitaire</h3>
          <ul className={styles.parcours}>
            {parcours.map((etape) => (
              <li key={etape.id} className={styles.parcoursItem}>
                <div className={styles.parcoursHeader}>
                  <span className={styles.parcoursDiplome}>{etape.diplome}</span>
                  <span className={styles.parcoursEtablissement}>{etape.etablissement}</span>
                </div>
                <p className={styles.parcoursDetails}>{etape.details}</p>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <a href="#contact" className={styles.btnPrimary}>Échanger ensemble</a>
            <a href="#projects" className={styles.btnSecondary}>Voir mes réalisations</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;

