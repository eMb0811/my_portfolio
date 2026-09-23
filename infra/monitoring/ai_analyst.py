import json
import urllib.request
import urllib.parse
import sys
import time

# Ensure UTF-8 output on Windows terminal
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

PROMETHEUS_URL = "http://localhost:9090"
LOKI_URL = "http://52.203.14.122:3100"
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.2:3b"

def query_prometheus(query):
    try:
        url = f"{PROMETHEUS_URL}/api/v1/query?query={urllib.parse.quote(query)}"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            if data["status"] == "success" and data["data"]["result"]:
                return float(data["data"]["result"][0]["value"][1])
    except Exception as e:
        print(f"Erreur requete Prometheus ({query}): {e}", file=sys.stderr)
    return None

def query_loki_recent_errors(limit=6):
    try:
        query = '{job=~".+"} |~ "(?i)(error|failed|fatal|critical)"'
        url = f"{LOKI_URL}/loki/api/v1/query_range?query={urllib.parse.quote(query)}&limit={limit}"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            logs = []
            if data["status"] == "success" and data["data"]["result"]:
                for stream in data["data"]["result"]:
                    for val in stream.get("values", []):
                        line = val[1].strip()
                        if line:
                            logs.append(line)
            return logs[:limit]
    except Exception as e:
        print(f"Erreur requete Loki: {e}", file=sys.stderr)
    return []

def push_report_to_loki(report_text):
    try:
        now_ns = str(time.time_ns())
        clean_text = report_text.replace("\n", " ")
        payload = json.dumps({
            "streams": [
                {
                    "stream": {
                        "job": "ai_analyst",
                        "host": "portfolio-server",
                        "model": MODEL
                    },
                    "values": [
                        [now_ns, f"[LLaMA 3.2 SRE] {clean_text}"]
                    ]
                }
            ]
        }).encode("utf-8")
        req = urllib.request.Request(f"{LOKI_URL}/loki/api/v1/push", data=payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status in (200, 204):
                print("\n✅ Rapport d'analyse transmis et synchronisé avec succès dans Grafana (Loki) !")
    except Exception as e:
        print(f"\nNote: Impossible d'expédier vers Loki: {e}", file=sys.stderr)

def main():
    print("=" * 65)
    print("🔍 COLLECTE OBSERVABILITE 360° : METRIQUES & LOGS EN DIRECT")
    print("=" * 65)

    # 1. Metriques Prometheus
    cpu = query_prometheus('100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)')
    ram = query_prometheus('(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100')
    disk = query_prometheus('(1 - (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"})) * 100')
    up = query_prometheus('up{job="node_exporter_ec2"}')

    status_str = "🟢 EN LIGNE (UP)" if up == 1 else "🔴 HORS LIGNE (DOWN)"
    print(f"  • Statut VPS Node Exporter : {status_str}")
    print(f"  • Utilisation CPU          : {cpu:.2f}%" if cpu is not None else "  • CPU : N/A")
    print(f"  • Utilisation RAM          : {ram:.2f}%" if ram is not None else "  • RAM : N/A")
    print(f"  • Utilisation Disque (/)   : {disk:.2f}%" if disk is not None else "  • Disque : N/A")
    print()

    # 2. Logs Loki
    print("📋 Recherche des derniers logs d'erreurs dans Loki...")
    recent_errors = query_loki_recent_errors(limit=5)
    if recent_errors:
        for idx, l in enumerate(recent_errors, 1):
            short_l = l[:120] + "..." if len(l) > 120 else l
            print(f"    [{idx}] {short_l}")
    else:
        print("    Aucune erreur critique recente detectee dans les logs Loki.")
    print()

    # 3. Preparation du prompt d'analyse SRE
    logs_context = "\n".join([f"- {l}" for l in recent_errors]) if recent_errors else "Aucun log d'erreur recent."

    prompt = f"""Tu es un ingenieur SRE Senior expert en observabilite (Prometheus, Loki, Linux).
Voici la telemetrie complete en direct du VPS (52.203.14.122) :

METRIQUES (Prometheus) :
- Statut Node Exporter : {'UP (en ligne)' if up == 1 else 'DOWN (hors ligne)'}
- Utilisation CPU : {cpu:.2f}%
- Utilisation RAM : {ram:.2f}%
- Utilisation Disque : {disk:.2f}%

LOGS RECENTS (Loki) :
{logs_context}

Redige un rapport d'analyse SRE professionnel et concis en 3 parties en francais :
1. Diagnostic global de sante du serveur (correlation metriques + logs)
2. Analyse detaillee des alertes ou anomalies detectees
3. Recommandations prioritaires d'action pour l'administrateur
"""

    print("🤖 Envoi du contexte a LLaMA 3.2 (via Ollama)...")
    print("-" * 65)

    payload = json.dumps({
        "model": MODEL,
        "prompt": prompt,
        "stream": True
    }).encode("utf-8")

    full_response = []
    req = urllib.request.Request(OLLAMA_URL, data=payload, headers={"Content-Type": "application/json"})
    
    with urllib.request.urlopen(req, timeout=120) as response:
        for line in response:
            if line:
                chunk = json.loads(line.decode("utf-8"))
                part = chunk.get("response", "")
                full_response.append(part)
                print(part, end="", flush=True)
    print("\n" + "=" * 65)

    # 4. Synchronisation automatique du rapport dans Loki (pour affichage Grafana)
    report_text = "".join(full_response)
    push_report_to_loki(report_text)

if __name__ == "__main__":
    main()
