# -*- coding: utf-8 -*-
"""
Générateur reproductible du CV Word (.docx) et export PDF 1 page via Microsoft Word
Fichiers générés :
  - public/cv-mouhamed-barry.docx
  - CV_Mouhamet_Barry.docx (racine du projet)
  - public/cv-mouhamed-barry.pdf
"""

import os
import shutil
import subprocess
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

# Palette de couleurs professionnelle & ATS-friendly
NAVY_DARK = RGBColor(0x0F, 0x17, 0x2A)   # #0F172A - Titres principaux & Nom
BLUE_ACCENT = RGBColor(0x02, 0x84, 0xC7) # #0284C7 - Sous-titre, catégories & accents
SLATE_TEXT = RGBColor(0x1E, 0x29, 0x3B)  # #1E293B - Corps de texte principal
MUTED_TEXT = RGBColor(0x47, 0x55, 0x69)  # #475569 - Métadonnées, liens & dates


def set_paragraph_bottom_border(paragraph, color_hex="0284C7", sz="8"):
    """Ajoute une bordure inférieure fine sous un titre de section."""
    pPr = paragraph._p.get_or_add_pPr()
    pBdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), sz)
    bottom.set(qn("w:space"), "2")
    bottom.set(qn("w:color"), color_hex)
    pBdr.append(bottom)
    pPr.append(pBdr)


def add_section_header(doc, title_text):
    """Crée un titre de section avec bordure inférieure et espacement équilibré."""
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(7.5)
    p.paragraph_format.space_after = Pt(3.5)
    p.paragraph_format.line_spacing = 1.08
    p.paragraph_format.keep_with_next = True
    set_paragraph_bottom_border(p, color_hex="0284C7", sz="6")

    run = p.add_run(title_text.upper())
    run.font.name = "Calibri"
    run.font.size = Pt(10.0)
    run.font.bold = True
    run.font.color.rgb = NAVY_DARK
    return p


def add_skill_line(doc, category_label, tools_text):
    """Ajoute une ligne de compétences par domaine."""
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(1.0)
    p.paragraph_format.space_after = Pt(2.0)
    p.paragraph_format.line_spacing = 1.12

    r_bullet = p.add_run("▪ ")
    r_bullet.font.name = "Calibri"
    r_bullet.font.size = Pt(8.8)
    r_bullet.font.bold = True
    r_bullet.font.color.rgb = BLUE_ACCENT

    r_cat = p.add_run(f"{category_label} : ")
    r_cat.font.name = "Calibri"
    r_cat.font.size = Pt(8.8)
    r_cat.font.bold = True
    r_cat.font.color.rgb = NAVY_DARK

    r_tools = p.add_run(tools_text)
    r_tools.font.name = "Calibri"
    r_tools.font.size = Pt(8.7)
    r_tools.font.color.rgb = SLATE_TEXT
    return p


def add_project_item(doc, title, repo_label, description, right_tab_cm=18.8):
    """Ajoute un projet phare avec en-tête aligné (Titre + Lien/Contexte à droite) et description."""
    p_head = doc.add_paragraph()
    p_head.paragraph_format.space_before = Pt(3.0)
    p_head.paragraph_format.space_after = Pt(0.8)
    p_head.paragraph_format.line_spacing = 1.08
    p_head.paragraph_format.keep_with_next = True
    p_head.paragraph_format.tab_stops.add_tab_stop(Cm(right_tab_cm), WD_TAB_ALIGNMENT.RIGHT)

    r_bullet = p_head.add_run("▸ ")
    r_bullet.font.name = "Calibri"
    r_bullet.font.size = Pt(9.0)
    r_bullet.font.bold = True
    r_bullet.font.color.rgb = BLUE_ACCENT

    r_title = p_head.add_run(title)
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(9.0)
    r_title.font.bold = True
    r_title.font.color.rgb = NAVY_DARK

    r_repo = p_head.add_run(f"\t{repo_label}")
    r_repo.font.name = "Calibri"
    r_repo.font.size = Pt(8.0)
    r_repo.font.bold = True
    r_repo.font.color.rgb = BLUE_ACCENT

    p_desc = doc.add_paragraph()
    p_desc.paragraph_format.left_indent = Cm(0.32)
    p_desc.paragraph_format.space_before = Pt(0)
    p_desc.paragraph_format.space_after = Pt(2.5)
    p_desc.paragraph_format.line_spacing = 1.12

    r_desc = p_desc.add_run(description)
    r_desc.font.name = "Calibri"
    r_desc.font.size = Pt(8.6)
    r_desc.font.color.rgb = SLATE_TEXT
    return p_head, p_desc


def add_education_item(doc, degree, institution, period, details, right_tab_cm=18.8):
    """Ajoute une ligne de formation académique."""
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2.5)
    p.paragraph_format.space_after = Pt(2.0)
    p.paragraph_format.line_spacing = 1.12
    p.paragraph_format.tab_stops.add_tab_stop(Cm(right_tab_cm), WD_TAB_ALIGNMENT.RIGHT)

    r_bullet = p.add_run("▪ ")
    r_bullet.font.name = "Calibri"
    r_bullet.font.size = Pt(8.9)
    r_bullet.font.bold = True
    r_bullet.font.color.rgb = BLUE_ACCENT

    r_deg = p.add_run(degree)
    r_deg.font.name = "Calibri"
    r_deg.font.size = Pt(8.9)
    r_deg.font.bold = True
    r_deg.font.color.rgb = NAVY_DARK

    r_inst = p.add_run(f" — {institution}")
    r_inst.font.name = "Calibri"
    r_inst.font.size = Pt(8.7)
    r_inst.font.italic = True
    r_inst.font.color.rgb = MUTED_TEXT

    r_per = p.add_run(f"\t{period}\n")
    r_per.font.name = "Calibri"
    r_per.font.size = Pt(8.5)
    r_per.font.bold = True
    r_per.font.color.rgb = BLUE_ACCENT

    r_det = p.add_run(f"   {details}")
    r_det.font.name = "Calibri"
    r_det.font.size = Pt(8.55)
    r_det.font.color.rgb = SLATE_TEXT
    return p


def build_cv_docx(output_docx_path):
    doc = Document()

    # Configuration de la page A4 avec marges optimisées pour 1 page dense et aérée
    section = doc.sections[0]
    section.page_width = Cm(21.0)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(0.85)
    section.bottom_margin = Cm(0.80)
    section.left_margin = Cm(1.10)
    section.right_margin = Cm(1.10)

    # Largeur utile = 21.0 - 2.2 = 18.8 cm
    usable_width_cm = 18.8

    # Style Normal par défaut
    normal_style = doc.styles["Normal"]
    normal_style.font.name = "Calibri"
    normal_style.font.size = Pt(8.5)
    normal_style.font.color.rgb = SLATE_TEXT

    # =========================================================================
    # EN-TÊTE
    # =========================================================================
    p_name = doc.add_paragraph()
    p_name.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_name.paragraph_format.space_before = Pt(0)
    p_name.paragraph_format.space_after = Pt(1)
    r_name = p_name.add_run("MOUHAMET BARRY")
    r_name.font.name = "Calibri"
    r_name.font.size = Pt(17)
    r_name.font.bold = True
    r_name.font.color.rgb = NAVY_DARK

    p_role = doc.add_paragraph()
    p_role.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_role.paragraph_format.space_before = Pt(0)
    p_role.paragraph_format.space_after = Pt(2)
    r_role = p_role.add_run(
        "Ingénierie Cloud, DevSecOps, Cybersécurité SOC & Réseaux Télécoms — Recherche de Stage (Fin d'études / Alternance)"
    )
    r_role.font.name = "Calibri"
    r_role.font.size = Pt(9.8)
    r_role.font.bold = True
    r_role.font.color.rgb = BLUE_ACCENT

    p_contact1 = doc.add_paragraph()
    p_contact1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_contact1.paragraph_format.space_before = Pt(0)
    p_contact1.paragraph_format.space_after = Pt(1)
    r_c1 = p_contact1.add_run(
        "Dakar, Sénégal (Mobilité / Remote)  •  elhadjibarry2001@gmail.com  •  mouhamet.barry@ucad.edu.sn"
    )
    r_c1.font.name = "Calibri"
    r_c1.font.size = Pt(8.4)
    r_c1.font.color.rgb = MUTED_TEXT

    p_contact2 = doc.add_paragraph()
    p_contact2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_contact2.paragraph_format.space_before = Pt(0)
    p_contact2.paragraph_format.space_after = Pt(3)
    r_c2 = p_contact2.add_run(
        "Portfolio : https://mbarry.is-a.dev  •  GitHub : https://github.com/eMb0811  •  LinkedIn : linkedin.com/in/mouhamed-barry-043375259"
    )
    r_c2.font.name = "Calibri"
    r_c2.font.size = Pt(8.4)
    r_c2.font.bold = True
    r_c2.font.color.rgb = NAVY_DARK

    # =========================================================================
    # 1. PROFIL PROFESSIONNEL
    # =========================================================================
    add_section_header(doc, "1. Profil Professionnel")
    p_prof = doc.add_paragraph()
    p_prof.paragraph_format.space_before = Pt(1)
    p_prof.paragraph_format.space_after = Pt(2)
    p_prof.paragraph_format.line_spacing = 1.08
    r_prof = p_prof.add_run(
        "Étudiant en Master 1 Réseaux & Télécommunications (UCAD) et diplômé d'une Licence en Informatique, spécialisé dans "
        "l'automatisation d'infrastructures Cloud/IaC (AWS, Terraform, Ansible, Kubernetes), l'observabilité 360° & la sécurité "
        "opérationnelle SOC/SOAR (Proxmox, pfSense, Suricata, Prometheus, Grafana, Wazuh) ainsi que le développement Full-Stack/IA. "
        "Rigoureux et orienté production, je recherche un stage de fin d'études ou une alternance pour contribuer à vos projets Cloud, DevSecOps, SRE ou Réseaux."
    )
    r_prof.font.name = "Calibri"
    r_prof.font.size = Pt(8.5)
    r_prof.font.color.rgb = SLATE_TEXT

    # =========================================================================
    # 2. COMPÉTENCES TECHNIQUES & OUTILS (PAR DOMAINE)
    # =========================================================================
    add_section_header(doc, "2. Compétences Techniques & Outils (Par Domaine)")

    add_skill_line(
        doc,
        "Cloud, Conteneurs & IaC",
        "AWS (EC2, VPC, Security Groups, ECR), Terraform (HCL), Ansible, Cloud-Init, Kubernetes (K3s, Kind, Minikube), Docker (Multi-stage, Compose, GHCR), Proxmox VE 8 (QEMU/KVM, LXC, RBAC), VMware.",
    )
    add_skill_line(
        doc,
        "CI/CD, DevSecOps & Serveurs Web",
        "GitHub Actions (Pipelines CI/CD, Déploiement K8s/SSH), Trivy (Scan vulnérabilités Shift-Left), Watchtower, Caddy 2 (HTTPS Let's Encrypt), Nginx, Apache Tomcat 10, ISPConfig 3.",
    )
    add_skill_line(
        doc,
        "Cybersécurité, SOC, Observabilité & AIOps",
        "Prometheus, VictoriaMetrics, Grafana (Alerting-as-Code, Dashboards), Grafana Loki, Promtail, Grafana Alloy, ClickHouse (Forensics), Suricata IDS (DPI L7), Wazuh SIEM, RSyslog, NTOPng, Blackbox/PVE/Node Exporter, AIOps (Python + Ollama LLaMA 3.2).",
    )
    add_skill_line(
        doc,
        "Réseaux, Télécoms & Sécurité Périmétrique",
        "Switch Cisco Catalyst (IOS, VLAN 802.1Q, STP, OSPF/EIGRP), SDN Mininet & Open vSwitch (Port Mirroring SPAN), pfSense 2.7 (Tables PF, Portail Captif, OpenVPN Site-to-Site), FreeRADIUS, OpenLDAP, DNS BIND9 Hiérarchique, ISC-DHCP, Postfix/Dovecot, Linux (Ubuntu Server, Debian 12, Netplan, iptables NAT/Firewall).",
    )
    add_skill_line(
        doc,
        "Développement Backend, Full-Stack, Mobile & IA",
        "Python (Django 4.2 DRF, Flask, Scripting SRE/SOC), Java 17 / Jakarta EE 10 (Servlets, JSP, JPA/Hibernate, JAX-RS, Maven), TypeScript / Next.js 14-15 / React 19, Mobile (React Native, Expo EAS APK, Android SDK), SQL (PostgreSQL 16, MySQL 8/MariaDB, Supabase RLS, Redis), Google Gemini API (Vision OCR & RAG SSE), Webhooks HMAC Wave & Orange Money.",
    )

    # =========================================================================
    # 3. RÉALISATIONS & PROJETS TECHNIQUES PHARES (AVEC OUTILS CITÉS)
    # =========================================================================
    add_section_header(doc, "3. Réalisations & Projets Techniques Phares")

    add_project_item(
        doc,
        "Plateforme SOC/SRE, Self-Healing & Quarantaine IP (Proxmox VE 8 & pfSense)",
        "github.com/eMb0811/supervision-securite-remediation-proxmox",
        "Supervision temps réel (5s) de 20+ conteneurs LXC/VMs (BIND9, OpenLDAP, FreeRADIUS) via Prometheus, Blackbox/PVE Exporter et Grafana Enterprise ; démon Python calculant un score de risque (0-100), redémarrage automatique des services (< 10s anti-crash-loop) et quarantaine chirurgicale d'IP sur pfSense/iptables + alertes Discord.",
        usable_width_cm,
    )
    add_project_item(
        doc,
        "Architecture NOC/SOC 360° Cloud-Native en 4 Couches",
        "github.com/eMb0811/architecture-noc-soc-360-lab",
        "Topologie SDN Mininet & Open vSwitch avec Port Mirroring SPAN vers sonde Suricata IDS (DPI L7, détection SQLi/Scans), cluster Kubernetes (Kind), collecte Grafana Alloy vers VictoriaMetrics, Loki et ClickHouse (Forensics L7), et Grafana Alerting-as-Code.",
        usable_width_cm,
    )
    add_project_item(
        doc,
        "Plateforme Gestion des Cotisations UCAD — Cloud Multi-Nœuds AWS & DevSecOps",
        "github.com/eMb0811/projet_cotisation_java",
        "Application Jakarta EE 10 / Hibernate / PostgreSQL 16 (reçus OpenPDF, exports Excel POI, paiements Wave/OM) déployée sur AWS VPC via Terraform et Ansible sur cluster Kubernetes K3s (RollingUpdate) avec registre Amazon ECR, scan Trivy et pipeline GitHub Actions.",
        usable_width_cm,
    )
    add_project_item(
        doc,
        "Réseaux Multi-VLAN Hybride Cisco/Proxmox & DNS Hiérarchique BIND9",
        "reseau-multi-vlan-proxmox • dns-hierarchique-proxmox-bind9",
        "Segmentation 802.1Q sur switch physique Cisco Catalyst 2950G et Proxmox VE, routeur Linux Ubuntu (Netplan, NAT iptables, ISC-DHCP), OpenVPN Site-to-Site pfSense, AAA FreeRADIUS/OpenLDAP, métrologie NTOPng ; automatisation Bash d'un arbre DNS mondial BIND9 sur 19 conteneurs LXC (Racine privée, 11 TLD, SLD).",
        usable_width_cm,
    )
    add_project_item(
        doc,
        "Portfolio Cloud-Native Auto-Hébergé & Agent SRE AIOps",
        "https://mbarry.is-a.dev • github.com/eMb0811/my_portfolio",
        "Provisioning AWS EC2 (Terraform/Ansible), Docker multi-stage, GHCR, Caddy SSL, Watchtower, stack Prometheus/Loki/Promtail (masquage PII) et agent SRE Python interrogeant LLaMA 3.2 (Ollama) pour injecter des diagnostics dans Grafana.",
        usable_width_cm,
    )
    add_project_item(
        doc,
        "Développement Full-Stack, Mobile & IA Générative",
        "eduflow • liggey-jarinu • senevent • momo-shop",
        "Plateforme EdTech IA EduFlow (Hackathon Open Source × AI 2026 : Next.js 14, TypeScript, Gemini Vision OCR & tuteur RAG SSE, Prisma, Docker) ; plateforme agroalimentaire Liggey-Jarinu (Django DRF, PostgreSQL, React, Webhooks HMAC Wave/OM, 22 tests Pytest) ; monorepo SénEvent (Web React Vercel + APK Android React Native Expo + Supabase RLS).",
        usable_width_cm,
    )

    # =========================================================================
    # 4. FORMATION ACADÉMIQUE & DISTINCTIONS
    # =========================================================================
    add_section_header(doc, "4. Formation Académique & Distinctions")

    add_education_item(
        doc,
        "Master 1 Réseaux & Télécommunications (RETEL)",
        "Université Cheikh Anta Diop de Dakar (UCAD)",
        "2025 – Présent",
        "Cloud Computing & Networking AWS (cursus SAA-C03), Administration de services réseaux, Systèmes répartis, Réseaux Haut Débit, Dév Web & Mobile.",
        usable_width_cm,
    )
    add_education_item(
        doc,
        "Licence en Informatique",
        "Université Cheikh Anta Diop de Dakar (UCAD)",
        "2022 – 2025",
        "Administration Systèmes Linux (LPIC-1), Réseaux & Routage Cisco (VLAN, OSPF, EIGRP, ACL, IPv6), Architectures distribuées Java EE, Bases de données SQL, Dév Mobile Android.",
        usable_width_cm,
    )

    p_dist = doc.add_paragraph()
    p_dist.paragraph_format.space_before = Pt(2)
    p_dist.paragraph_format.space_after = Pt(0)
    p_dist.paragraph_format.line_spacing = 1.05

    r_b = p_dist.add_run("▪ ")
    r_b.font.name = "Calibri"
    r_b.font.size = Pt(8.6)
    r_b.font.bold = True
    r_b.font.color.rgb = BLUE_ACCENT

    r_hl = p_dist.add_run("Hackathon & Langues : ")
    r_hl.font.name = "Calibri"
    r_hl.font.size = Pt(8.6)
    r_hl.font.bold = True
    r_hl.font.color.rgb = NAVY_DARK

    r_ht = p_dist.add_run(
        "Participant au Hackathon Open Source × AI 2026 (Galsen DEV / Hacktoberfest Dakar)  |  Français : Courant  |  Anglais : Technique (lecture de documentation, CLI, ingénierie)."
    )
    r_ht.font.name = "Calibri"
    r_ht.font.size = Pt(8.5)
    r_ht.font.color.rgb = SLATE_TEXT

    os.makedirs(os.path.dirname(output_docx_path), exist_ok=True)
    doc.save(output_docx_path)
    print(f"✅ Fichier Word généré : {output_docx_path}")


def convert_docx_to_pdf_via_word(docx_path, pdf_path):
    """Convertit le fichier .docx en .pdf via Microsoft Word COM et vérifie le nombre de pages."""
    abs_docx = os.path.abspath(docx_path)
    abs_pdf = os.path.abspath(pdf_path)

    ps_script = f"""
    $ErrorActionPreference = 'Stop'
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    try {{
        $doc = $word.Documents.Open("{abs_docx}", $false, $true)
        $doc.Repaginate()
        $pages = $doc.ComputeStatistics(2) # wdStatisticPages = 2
        Write-Output "WORD_PAGE_COUNT=$pages"
        $doc.ExportAsFixedFormat("{abs_pdf}", 17, $false, 0) # 17 = wdExportFormatPDF
        $doc.Close($false)
    }} finally {{
        $word.Quit()
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
    }}
    """
    res = subprocess.run(
        ["powershell", "-NoProfile", "-Command", ps_script],
        capture_output=True,
        text=True,
        check=True,
    )
    print(res.stdout.strip())
    print(f"✅ Fichier PDF généré depuis Word : {abs_pdf}")


if __name__ == "__main__":
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    public_docx = os.path.join(root_dir, "public", "cv-mouhamed-barry.docx")
    root_docx = os.path.join(root_dir, "CV_Mouhamet_Barry.docx")
    public_pdf = os.path.join(root_dir, "public", "cv-mouhamed-barry.pdf")

    build_cv_docx(public_docx)
    shutil.copy2(public_docx, root_docx)
    print(f"✅ Copie racine créée : {root_docx}")
    convert_docx_to_pdf_via_word(public_docx, public_pdf)
