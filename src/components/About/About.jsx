import styles from './About.module.css';
import useReveal from '../../hooks/useReveal.js';
import photoMb from '../../assets/photo_mb.jpg';
import { GitHubIcon, LinkedInIcon } from '../common/Icons.jsx';
import { trackCvDownload, trackContactClick } from '../../utils/telemetry.js';
import { handleSpotlightMove } from '../../utils/spotlight.js';

const parcours = [
  {
    id: 'm1',
    diplome: 'Master 1 – Réseaux et Télécommunications (RETEL)',
    etablissement: 'Faculté des Sciences et Techniques (FST) – Université Cheikh Anta Diop de Dakar (2025 – Présent)',
    details:
      'Modules clés : Cloud Computing & Networking AWS (aligné SAA-C03), Administration de services réseaux (Proxmox VE, BIND9, ISPConfig, pfSense, FreeRADIUS/OpenLDAP), Systèmes répartis, Réseaux Haut Débit & Technologies d’accès, Développement d’Applications Web & Mobile (DAWM) et Machine Learning.',
  },
  {
    id: 'l3',
    diplome: 'Licence en Informatique (L1 → L3)',
    etablissement: 'Faculté des Sciences et Techniques (FST) – Université Cheikh Anta Diop de Dakar (2022 – 2025)',
    details:
      'Modules clés : Administration Systèmes Linux (cursus LPIC-1), Réseaux & Routage Cisco (VLAN 802.1Q, STP, RIP, OSPF, EIGRP, ACL, IPv6), Programmation Java distribuée & Jakarta EE (RMI, Sockets multithread, Servlets/JSP, Hibernate, JAX-RS), Bases de données relationnelles (PostgreSQL, MySQL, Triggers) et Développement Mobile Android natif.',
  },
  {
    id: 'hackathon',
    diplome: 'Hackathon Open Source × AI 2026 — Galsen DEV / Hacktoberfest Dakar',
    etablissement: 'Conception & Déploiement de la plateforme EdTech IA « EduFlow » (Octobre 2026)',
    details:
      'Orchestration multi-agents IA, extraction d’emplois du temps par Gemini Vision OCR, tuteur pédagogique RAG en streaming SSE avec rendu mathématique KaTeX, génération de Flashcards 3D / QCM et conteneurisation Docker Compose.',
  },
];

const piliers = [
  {
    id: 'cloud-devsecops',
    titre: 'Cloud (AWS), IaC & DevSecOps',
    description:
      'Provisioning d’architectures multi-nœuds sur AWS (EC2, VPC, ECR) avec Terraform, gestion de configuration Ansible, orchestration Kubernetes (K3s, Kind, Minikube), Docker multi-stage et pipelines CI/CD GitHub Actions sécurisés par Trivy, Caddy SSL et Watchtower.',
  },
  {
    id: 'soc-observabilite',
    titre: 'Cybersécurité, SOC 360° & AIOps',
    description:
      'Supervision haute résolution et corrélation d’attaques via Prometheus, VictoriaMetrics, Grafana (Alerting-as-Code), Loki/Promtail, Alloy et ClickHouse. Détection d’intrusions Suricata IDS (OVS SPAN) & Wazuh SIEM, auto-réparation (Self-Healing < 10s), quarantaine chirurgicale d’IP sur pfSense/iptables et diagnostic SRE via LLaMA 3.2.',
  },
  {
    id: 'reseaux-telecoms',
    titre: 'Réseaux, Télécoms & Virtualisation',
    description:
      'Administration de clusters Proxmox VE 8 (20+ conteneurs LXC & VMs QEMU, pools RBAC), commutation physique Cisco Catalyst 2950G (Trunk 802.1Q, STP Portfast), routeurs Linux Ubuntu (Netplan, NAT iptables), tunnels OpenVPN Site-to-Site pfSense, portail captif AAA (FreeRADIUS/OpenLDAP) et arbre DNS mondial BIND9.',
  },
  {
    id: 'dev-fullstack-ia',
    titre: 'Dév Full-Stack, Mobile & IA Générative',
    description:
      'Conception d’applications robustes en Java 17 / Jakarta EE 10 (Hibernate, Tomcat 10, OpenPDF), Python / Django 4.2 DRF (PostgreSQL, Webhooks HMAC Wave/Orange Money) et TypeScript / Next.js 15 / React 19, ainsi que d’applications mobiles React Native / Expo EAS (APK Android) et d’assistants RAG sous Google Gemini.',
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
          <div
            className={`${styles.profileCard} spotlightCard`}
            onMouseMove={handleSpotlightMove}
          >
            <div className={styles.avatarContainer}>
              <img src={photoMb} alt="Mouhamet Barry" className={styles.avatarImg} />
            </div>

            <h3 className={styles.profileName}>Mouhamet Barry</h3>
            <p className={styles.profileRole}>Master 1 RETEL • Cloud, DevSecOps &amp; SOC</p>

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
                <span className={styles.metaLabel}>Focus :</span>
                <span className={styles.metaValue}>Cloud, K8s, SOC &amp; Réseaux</span>
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
                onClick={() => trackContactClick('About GitHub')}
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
                onClick={() => trackContactClick('About LinkedIn')}
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
            <span className={styles.badgeNum}>01.</span> APERÇU &amp; PROFIL D’INGÉNIERIE
          </div>
          <h2 className={styles.title}>
            Bâtir, automatiser et sécuriser des infrastructures Cloud, Réseaux et SOC résilientes.
          </h2>

          <div className={styles.content}>
            <p className={styles.text}>
              Actuellement étudiant en <strong>Master 1 Réseaux et Télécommunications (RETEL)</strong> à l’Université
              Cheikh Anta Diop de Dakar (UCAD) et diplômé d’une <strong>Licence en Informatique</strong>, je combine
              une double compétence en <strong>ingénierie des infrastructures réseaux/systèmes</strong> et en
              <strong> développement logiciel Cloud-Native</strong>.
            </p>

            <p className={styles.text}>
              À travers mes travaux pratiques avancés et mes projets personnels sur GitHub, j’ai déployé et interconnecté
              des environnements complets : clusters <strong>Kubernetes (K3s, Kind)</strong> sur <strong>AWS</strong> provisionnés
              par <strong>Terraform et Ansible</strong>, infrastructures virtualisées sous <strong>Proxmox VE 8</strong> (plus de 20 conteneurs LXC et VMs),
              segmentation matérielle <strong>Cisco Catalyst 802.1Q</strong>, tunnels <strong>OpenVPN Site-to-Site pfSense</strong>,
              fédération d’identité <strong>FreeRADIUS / OpenLDAP</strong> et arbre <strong>DNS mondial BIND9</strong>.
            </p>

            <p className={styles.text}>
              Passionné par la <strong>cybersécurité opérationnelle (SecOps / SOC) et le SRE</strong>, j’implémente des architectures
              d’observabilité 360° (<strong>Prometheus, VictoriaMetrics, Grafana, Loki, Alloy, ClickHouse</strong>), des sondes de détection
              d’intrusions (<strong>Suricata IDS en Port Mirroring OVS SPAN, Wazuh SIEM</strong>) ainsi que des moteurs Python d’<strong>auto-réparation
              (Self-Healing)</strong>, de <strong>quarantaine chirurgicale d’IP</strong> et d’<strong>analyse SRE assistée par IA (LLaMA 3.2 &amp; Gemini)</strong>.
            </p>
          </div>

          <h3 className={styles.subtitle}>Quatre domaines d’expertise complémentaires</h3>
          <div className={styles.piliersGrid}>
            {piliers.map((p, index) => (
              <div
                key={p.id}
                className={`${styles.pilierCard} spotlightCard staggerItem`}
                style={{ '--stagger-delay': `${index * 65}ms` }}
                onMouseMove={handleSpotlightMove}
              >
                <h4 className={styles.pilierTitle}>{p.titre}</h4>
                <p className={styles.pilierDesc}>{p.description}</p>
              </div>
            ))}
          </div>

          <h3 className={styles.subtitle}>Parcours universitaire &amp; Hackathon</h3>
          <ul className={styles.parcours}>
            {parcours.map((etape, index) => (
              <li
                key={etape.id}
                className={`${styles.parcoursItem} staggerItem`}
                style={{ '--stagger-delay': `${index * 80}ms` }}
              >
                <div className={styles.parcoursHeader}>
                  <span className={styles.parcoursDiplome}>{etape.diplome}</span>
                  <span className={styles.parcoursEtablissement}>{etape.etablissement}</span>
                </div>
                <p className={styles.parcoursDetails}>{etape.details}</p>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <a
              href={`${import.meta.env.BASE_URL}cv-mouhamed-barry.pdf`}
              download="CV_Mouhamet_Barry.pdf"
              className={styles.btnPrimary}
              title="Télécharger mon CV (PDF)"
              onClick={() => trackCvDownload('About')}
            >
              <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Télécharger mon CV (PDF)</span>
            </a>
            <a
              href="#contact"
              className={styles.btnSecondary}
              onClick={() => trackContactClick('About Bouton Contact')}
            >
              Me contacter
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
