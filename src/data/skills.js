export const categoriesSkills = [
  'Cloud, DevSecOps & IaC',
  'Cybersécurité, SOC & Observabilité',
  'Réseaux, Télécoms & Virtualisation',
  'Dév Full-Stack, Mobile & IA',
  'Tous',
];

export const skills = [
  // ============================================================================
  // 1. CLOUD, DEVSECOPS & IAC (4 compétences)
  // ============================================================================
  {
    id: 'cloud-iac',
    nom: 'Cloud (AWS) & Infrastructure as Code',
    categorie: 'Cloud, DevSecOps & IaC',
    niveau: 4,
    pourcentage: 82,
    statut: 'Opérationnel',
    tags: ['AWS EC2 / VPC / SG', 'Amazon ECR', 'Terraform (HCL)', 'Cloud-Init', 'Architecture SAA-C03'],
  },
  {
    id: 'ansible-config',
    nom: 'Automatisation & Gestion de Configuration',
    categorie: 'Cloud, DevSecOps & IaC',
    niveau: 4,
    pourcentage: 84,
    statut: 'Opérationnel',
    tags: ['Ansible Playbooks', 'Systemd & Hardening', 'Provisioning K3s / DB', 'Bash / PowerShell', 'Swap & Tuning Linux'],
  },
  {
    id: 'k8s-containers',
    nom: 'Conteneurisation Docker & Kubernetes',
    categorie: 'Cloud, DevSecOps & IaC',
    niveau: 4,
    pourcentage: 85,
    statut: 'Opérationnel',
    tags: ['Docker Multi-Stage', 'Docker Compose', 'Kubernetes (K3s, Kind, Minikube)', 'RollingUpdate & Probes', 'GHCR & Docker Hub'],
  },
  {
    id: 'cicd-devsecops',
    nom: 'Pipelines CI/CD, GitOps & DevSecOps',
    categorie: 'Cloud, DevSecOps & IaC',
    niveau: 4,
    pourcentage: 84,
    statut: 'Opérationnel',
    tags: ['GitHub Actions', 'Trivy (Shift-Left)', 'Watchtower Auto-Deploy', 'Caddy 2 SSL (Let’s Encrypt)', 'Nginx Reverse Proxy'],
  },

  // ============================================================================
  // 2. CYBERSÉCURITÉ, SOC & OBSERVABILITÉ (4 compétences)
  // ============================================================================
  {
    id: 'observabilite-metrics',
    nom: 'Supervision Temps Réel & Métriques (NOC/SRE)',
    categorie: 'Cybersécurité, SOC & Observabilité',
    niveau: 4,
    pourcentage: 86,
    statut: 'Opérationnel',
    tags: ['Prometheus (TSDB)', 'VictoriaMetrics', 'Grafana Enterprise (Node Graph)', 'Alerting-as-Code', 'Blackbox / PVE / Node Exporter'],
  },
  {
    id: 'logs-forensics',
    nom: 'Centralisation de Logs & Forensics Réseau',
    categorie: 'Cybersécurité, SOC & Observabilité',
    niveau: 4,
    pourcentage: 82,
    statut: 'Opérationnel',
    tags: ['Grafana Loki v3', 'Promtail (Redaction PII)', 'Grafana Alloy', 'ClickHouse (Forensics L7)', 'RSyslog & NTOPng'],
  },
  {
    id: 'ids-siem-soc',
    nom: 'Détection d’Intrusions (IDS) & SIEM SOC',
    categorie: 'Cybersécurité, SOC & Observabilité',
    niveau: 4,
    pourcentage: 80,
    statut: 'Opérationnel',
    tags: ['Suricata IDS (DPI L7, eve.json)', 'Wazuh SIEM / HIDS', 'Port Mirroring OVS (SPAN)', 'Détection SQLi / Nmap', 'FIM & Threat Hunting'],
  },
  {
    id: 'soar-aiops',
    nom: 'Remédiation Active (SOAR), Self-Healing & AIOps',
    categorie: 'Cybersécurité, SOC & Observabilité',
    niveau: 4,
    pourcentage: 82,
    statut: 'Opérationnel',
    tags: ['Self-Healing Python (< 10s)', 'Quarantaine IP pfSense / iptables', 'Score de Risque Corrélé', 'Agent SRE Ollama (LLaMA 3.2)', 'Webhooks Discord / n8n'],
  },

  // ============================================================================
  // 3. RÉSEAUX, TÉLÉCOMS & VIRTUALISATION (4 compétences)
  // ============================================================================
  {
    id: 'proxmox-virt',
    nom: 'Virtualisation d’Entreprise (Proxmox VE & VMware)',
    categorie: 'Réseaux, Télécoms & Virtualisation',
    niveau: 4,
    pourcentage: 88,
    statut: 'Opérationnel',
    tags: ['Proxmox VE 8.x', 'Conteneurs LXC & VMs QEMU', 'Bridges VLAN-Aware (vmbr)', 'Pools & RBAC (@pve)', 'VMware Workstation'],
  },
  {
    id: 'cisco-sdn-vlan',
    nom: 'Commutation, Routage Multi-VLAN & SDN',
    categorie: 'Réseaux, Télécoms & Virtualisation',
    niveau: 4,
    pourcentage: 85,
    statut: 'Opérationnel',
    tags: ['Switch Cisco Catalyst (IOS)', 'Trunk 802.1Q & STP Portfast', 'Router-on-a-Stick Ubuntu (Netplan)', 'OSPF / EIGRP / RIP / IPv6', 'Mininet & Open vSwitch (OVS)'],
  },
  {
    id: 'pfsense-vpn-aaa',
    nom: 'Pare-feu pfSense, VPN & Authentification AAA',
    categorie: 'Réseaux, Télécoms & Virtualisation',
    niveau: 4,
    pourcentage: 83,
    statut: 'Opérationnel',
    tags: ['pfSense CE 2.7', 'OpenVPN Site-to-Site', 'FreeRADIUS (UDP 1812)', 'Annuaire OpenLDAP (slapd)', 'Portail Captif & NAT iptables'],
  },
  {
    id: 'dns-mail-hosting',
    nom: 'DNS Hiérarchique BIND9, Messagerie & Hébergement',
    categorie: 'Réseaux, Télécoms & Virtualisation',
    niveau: 4,
    pourcentage: 86,
    statut: 'Opérationnel',
    tags: ['BIND9 (Racine, TLD, SLD, Glue)', 'ISC-DHCP & Dnsmasq', 'ISPConfig 3 & Virtualmin', 'Postfix / Dovecot / Roundcube', 'WordPress & Redis Cache'],
  },

  // ============================================================================
  // 4. DÉV FULL-STACK, MOBILE & IA (4 compétences)
  // ============================================================================
  {
    id: 'python-django',
    nom: 'Python, API RESTful Django DRF & Scripting SRE',
    categorie: 'Dév Full-Stack, Mobile & IA',
    niveau: 4,
    pourcentage: 82,
    statut: 'Opérationnel',
    tags: ['Python 3.11+', 'Django 4.2 & DRF', 'SimpleJWT & OpenAPI Swagger', 'Flask & Gunicorn', 'Pytest & Automatisation Système'],
  },
  {
    id: 'java-jakarta',
    nom: 'Java 17, Jakarta EE 10 & Architectures Distribuées',
    categorie: 'Dév Full-Stack, Mobile & IA',
    niveau: 4,
    pourcentage: 80,
    statut: 'Opérationnel',
    tags: ['Java 17 & Jakarta EE 10', 'Servlets 6 / JSP / CDI Weld', 'JPA / Hibernate 6 & HikariCP', 'JAX-RS REST & RMI', 'Maven Multi-Module & Tomcat 10'],
  },
  {
    id: 'ts-nextjs-react',
    nom: 'Full-Stack TypeScript, Next.js 15 & React 19',
    categorie: 'Dév Full-Stack, Mobile & IA',
    niveau: 4,
    pourcentage: 80,
    statut: 'Opérationnel',
    tags: ['Next.js 14 / 15 (App Router)', 'React 19 & TypeScript 5', 'Prisma ORM & Zod', 'PWA & Service Workers', 'Tailwind CSS v4 & Shadcn UI'],
  },
  {
    id: 'mobile-ia-db',
    nom: 'Mobile (React Native / Android), Bases SQL & IA',
    categorie: 'Dév Full-Stack, Mobile & IA',
    niveau: 3,
    pourcentage: 78,
    statut: 'Pratique',
    tags: ['React Native & Expo EAS (APK)', 'Android SDK (Java)', 'Google Gemini API (Vision OCR & RAG)', 'PostgreSQL 16 / MySQL 8 / Supabase RLS', 'Webhooks HMAC Wave & Orange Money'],
  },
];
