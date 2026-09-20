# 🛡️ AegisTrace: Dark Web Threat Actor Attribution Platform
### *Multi-Modal Forensic Evidence Fusion & De-Anonymization Engine*
**Smart India Hackathon (SIH) Cybersecurity Demo Edition**

---

## 🌟 Executive Overview

**AegisTrace** is an end-to-end threat intelligence and attribution system designed to de-anonymize underground threat actors operating across disparate dark web forums, onion hidden services, and encrypted messengers. 

Most threat intelligence tools present fragmented, isolated reports. **AegisTrace's core differentiator** is its **Explainable Multi-Source Bayesian Evidence Fusion Engine**, which unifies four orthogonal forensic evidence streams into **ONE auditable, mathematically grounded confidence score (0–100%)** alongside a transparent evidence trail breakdown.

```
+-----------------------------------------------------------------------------------+
|                            4 FORENSIC EVIDENCE STREAMS                            |
+---------------------+---------------------+-------------------+-------------------+
|  1. Infra Scanner   |  2. Identity Graph  | 3. AI Stylometry  | 4. Crypto Cluster |
| .onion leak rules   | Graphology + GNN    | all-MiniLM-L6-v2  | UTXO multi-input  |
| cert/status matches | Link Prediction     | + diurnal timing  | + temporal sync   |
+----------+----------+----------+----------+---------+---------+---------+---------+
           |                     |                    |                   |
           +---------------------+----------+---------+-------------------+
                                            |
                                            v
                +-------------------------------------------------------+
                |         EXPLAINABLE BAYESIAN FUSION ENGINE            |
                |  P_0 = 50%  -->  Weighted Log-Odds Belief Updating    |
                +---------------------------+---------------------------+
                                            |
                                            v
                +-------------------------------------------------------+
                |    UNIFIED ATTRIBUTION SCORE & VISUAL EVIDENCE TRAIL  |
                |   "98% Confidence: Wasabi Cluster (36%), Cert (25%)"  |
                +-------------------------------------------------------+
```

---

## 🔬 The 4 Evidence Modules

### 🌐 Module 1: Infrastructure Leak Scanner
- **Capabilities**: Simulates automated scanning of `.onion` Tor hidden services for operational security (OPSEC) failures.
- **Rules Engine**:
  - `RULE_INFRA_01_CRITICAL`: Status page exposure (`/server-status`, `phpinfo.php`) leaking clearnet IP + SSL certificate SHA-256 fingerprint matching known clearnet registry ($\ge 0.95$ score).
  - `RULE_INFRA_02_SSH_KEY`: OpenSSH host key fingerprint collision between darknet port 22 and clearnet VPS ($\ge 0.88$ score).
  - `RULE_INFRA_03_CERT_REUSE`: Hidden service presenting a public clearnet certificate without SNI strip ($\ge 0.82$ score).
  - `RULE_INFRA_04_BANNER_FAVICON`: Murmur3 Favicon hash + custom HTTP server banner alignment ($\ge 0.58$ score).

### 🕸️ Module 2: Identity Graph Builder & Link Prediction
- **Capabilities**: Constructs an interconnected knowledge graph of personas, PGP keys, Bitcoin/Monero addresses, Jabber/Tox handles, and underground forums.
- **Hard Link Detection**: Immediate identification of shared cryptographic keys, wallet reuse, or common communication handles.
- **Novel Link Prediction Heuristic (GNN Approximation)**: Even without shared identifiers, detects hidden connections by computing multi-dimensional overlap across:
  1. Commodity / Threat Category alignment (e.g. specialized ESXi ransomware, 0-day brokers)
  2. Underground forum co-presence (Dread, Exploit.in, XSS, BreachForums)
  3. Operational timeframe synchronicity
  4. Handle morphological & n-gram naming patterns

### 🧠 Module 3: AI Persona Linking (Stylometry + Behavioral Forensics)
- **Capabilities**: Uses NLP transformers (`@xenova/transformers`, `all-MiniLM-L6-v2`) to convert actor writing corpora into 384-dimensional latent semantic embeddings and calculates cosine similarity.
- **Novel Behavioral Fingerprinting**: Extracts non-textual behavioral metrics:
  - **Diurnal Time-of-Day Histogram**: 24-hour UTC posting distribution overlap via histogram intersection.
  - **Syntax & Punctuation Habits**: Punctuation frequency, exclamation/question patterns, uppercase entropy.
  - **Lexical Slang Profiling**: Underground cyber jargon (`FUD`, `OPSEC`, `0day`, `ChaCha20`, `RAT`, `escrow`).
- Combines semantic text similarity ($60\%$) with behavioral timing/syntax ($40\%$).

### 💰 Module 4: Crypto Wallet Correlation & Temporal Sync
- **Capabilities**: Implements UTXO multi-input clustering (common-input ownership heuristic) and maps transactions against known exchange KYC deposit addresses and CoinJoin mixer pools (Wasabi / ChipMixer).
- **Novel Temporal Correlation Engine**: Analyzes timing causality between on-chain incoming/outgoing transactions and darknet forum events ("escrow released", "keys sent", "payment confirmed") within a $\pm 3.5$-hour delta window.

---

## ⚡ The Key Novel Feature: Explainable Bayesian Evidence Fusion Engine

The fusion engine operates in **log-odds space** using Bayesian updating:

1. **Base Prior Probability**: $P_0 = 0.50 \implies \text{Prior Odds } O_0 = \frac{P_0}{1 - P_0} = 1.0$
2. **Reliability Weight Scaling**:
   - Crypto Correlation ($w_{\text{crypto}} = 0.35$ - deterministic blockchain ground truth)
   - Infrastructure Leak ($w_{\text{infra}} = 0.25$ - deterministic cert/server match)
   - Stylometry & Behavior ($w_{\text{style}} = 0.20$ - linguistic & diurnal pattern)
   - Identity Graph ($w_{\text{graph}} = 0.20$ - structural & heuristic overlap)
3. **Likelihood Ratio (Bayes Factor)** for evidence $i$:
   $$\text{LR}_i = \left( \frac{\max(0.02, S_i)}{1 - \min(0.98, S_i)} \right)^{w_i \times 1.5}$$
4. **Posterior Odds**:
   $$O_{\text{post}} = O_0 \times \prod_{i=1}^{4} \text{LR}_i$$
5. **Final Confidence Probability**:
   $$P(\text{Attribution}) = \frac{O_{\text{post}}}{1 + O_{\text{post}}} \times 100\%$$
6. **Auditable Evidence Trail**: Calculates exact percentage contribution of each clue, tier classification (`STRONG`, `MODERATE`, `WEAK`), and step-by-step mathematical logs.

---

## 🎯 Demo Benchmark Cases (What to Show Hackathon Judges)

| Case ID | Persona Pair | Target Category | Key Correlating Evidence | Expected Confidence |
|---|---|---|---|---|
| **Case 1** | `KryptonGhost` $\leftrightarrow$ `VektorZero` | Ransomware Syndicate | Exposed OVH Cert + Wasabi CoinJoin cluster + Diurnal timing | **98% (HIGH)** |
| **Case 2** | `SilkCobalt` $\leftrightarrow$ `HydraMedic` | Darknet Narcotics Vendor | Identical PGP key + Binance KYC deposit + 40min temporal sync | **95% (HIGH)** |
| **Case 3** | `ZeroByte_Dev` $\leftrightarrow$ `NexusRogue` | 0-Day Exploit Broker | Link Prediction TTP overlap + Custom Nginx banner mirror | **84% (HIGH)** |
| **Case 4** | `CinderLock` $\leftrightarrow$ `VolcanoStress` | DDoS Stresser Botnet | Shared SSH host key on port 22 + Shared TG channel handle | **88% (HIGH)** |
| **Decoy** | `KryptonGhost` $\leftrightarrow$ `SilkCobalt` | Uncorrelated Personas | No shared UTXOs, divergent stylometry, distinct infra | **5% (LOW)** |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js $\ge 18.0$
- npm $\ge 9.0$
- A MongoDB Atlas cluster (free tier is fine) — optional but recommended; the app runs on in-memory seed data if you skip this

### 1. Configure the backend environment
```bash
cd backend
cp .env.example .env
```
Open `.env` and fill in:
- `MONGODB_URI` — your Atlas connection string (Atlas dashboard → Connect → Drivers)
- `JWT_SECRET` — any long random string
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` and `INVESTIGATOR_USERNAME` / `INVESTIGATOR_PASSWORD` — the two accounts that get seeded automatically on first boot

### 2. Run the Backend
```bash
npm install
node server.js
```
*Backend runs at `http://localhost:5001`.*
*Run automated test suite: `npm test`.*

On first boot with `MONGODB_URI` set, the backend seeds your Atlas cluster with the demo dataset (if empty) and creates the admin/investigator accounts from `.env`. Without `MONGODB_URI`, the app still runs fully — login just responds with a 503 until Atlas is connected, since accounts live in Mongo.

### 3. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173`.*

Open the app and you'll land on the login screen — pick the **Investigator Login** or **Admin Login** tab and sign in with the credentials from `backend/.env`.

---

## 🔐 Roles & Access

| Role | Can do |
|---|---|
| **Investigator** | Everything in the SOC dashboard: browse actors, run the identity graph, the pair-comparison lab, the infra scanner, and export dossiers/CSV/STIX. |
| **Admin** | Everything an Investigator can do, **plus** a "Dataset Management" panel to upload a CSV of new/updated threat actor records, download a CSV template, watch live ingestion activity, and reset the database to seed state. |

All API routes require a logged-in session (JWT); dataset-mutating routes are further restricted to the `admin` role.

## 📤 Admin: Updating the Dataset via CSV
From the Admin account, open **Dataset Management** in the sidebar and drag a `.csv` onto the dropzone (or use **Download CSV Template** to get the exact column headers). Rows with a matching `id` update that actor; blank/new `id`s create new records. Every upload updates the live in-memory attribution engine immediately and — if `MONGODB_URI` is configured — is persisted to your Atlas cluster.

## 🕷️ Continuous Crawler / Scraper
`backend/services/scraperService.js` runs on a timer (`SCRAPER_INTERVAL_MS` in `.env`, default 60s) and simulates a crawler feeding new sightings into the dataset. This sandbox has no real Tor/dark-web network access, so it's a clearly-marked simulation — the exact spot to plug in a real crawling pipeline (swap `generateSighting()` for your actual scraper output, keep the rest). Set `SCRAPER_ENABLED=false` to turn it off.

---

## 🖥️ UI & SOC Dashboard Features
- **Executive SOC Dashboard**: Real-time metrics, high-probability attribution alerts feed, threat vector breakdown.
- **Threat Actor Directory**: Searchable, filterable table with category pills, threat badges, and quick jump buttons.
- **Dossier Deep-Dive View**: 4-tab panel covering Identifiers, Infrastructure, Attributions with Evidence Trails, and Timeline.
- **Interactive Knowledge Graph (`vis-network`)**: Canvas with physics simulation, color-coded evidence edges, confidence threshold slider, and inspector drawer.
- **Dual Persona Link Investigator**: Head-to-head lab with **dynamic Bayesian weight sliders** for instant sensitivity testing.
- **Onion Infrastructure Scanner**: Simulated live probe console against clearnet database.
- **Forensic Report Export**: One-click STIX 2.1 JSON, CSV, and printable classified forensic dossier layout.
- **Admin Dataset Management**: CSV bulk upload/update, template download, live ingestion log.
- **Role-based login**: separate Admin / Investigator sign-in, light and dependency-free UI (no Bootstrap).

---

## 🌐 Deployment

The simplest option: **one service, one URL.** The backend can serve the built frontend directly.

### Recommended: single-service deploy (Render, Railway, Fly.io, a VPS, etc.)
1. Push this project to a GitHub repo.
2. On your host, create a Node.js web service pointed at the `backend/` folder, with:
   - **Build command:** `npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend`
   - **Start command:** `node backend/server.js`
3. Set these environment variables on the host (same names as `.env`):
   `MONGODB_URI`, `JWT_SECRET` (a real random string — don't leave the placeholder), `ADMIN_USERNAME`/`ADMIN_PASSWORD`, `INVESTIGATOR_USERNAME`/`INVESTIGATOR_PASSWORD`, `NODE_ENV=production`.
4. In MongoDB Atlas → Network Access, allow your host's IP (or `0.0.0.0/0` if your platform uses dynamic IPs — most free-tier PaaS do).
5. Deploy. The backend detects the built `frontend/dist` folder automatically and serves the whole app — frontend and API — from that one URL. No CORS config needed, since it's all the same origin.

### Alternative: split deploy (frontend and backend on different hosts)
E.g. frontend on Vercel/Netlify, backend on Render/Railway.
1. Deploy `backend/` as above (skip the frontend build step), note its URL (e.g. `https://aegistrace-api.onrender.com`).
2. Deploy `frontend/` separately, setting a build-time env var `VITE_API_BASE=https://aegistrace-api.onrender.com/api`.
3. On the backend, set `CORS_ORIGIN` to your frontend's exact deployed URL (e.g. `https://aegistrace.vercel.app`), so the browser is allowed to call the API cross-origin.

### Before going live, change these from their defaults
- `JWT_SECRET` — any long random string
- `ADMIN_PASSWORD` / `INVESTIGATOR_PASSWORD` — not the `.env.example` placeholders
- Consider `SCRAPER_ENABLED=false` if you don't want the simulated crawler writing to your live Atlas cluster continuously

---

## ⚖️ Hackathon Disclaimer
*This platform is built strictly for demonstration and research purposes as part of the Smart India Hackathon (SIH). All darknet handles, onion records, wallet addresses, and forum posts are synthetically generated mock datasets. The "continuous crawler" is a simulated data generator, not a real dark-web scraper.*

