<p align="center">
  <strong style="font-size:2em;">VE<span style="color:#2563eb">I</span>L</strong>
</p>

<h3 align="center">Private Clinical Trial Screening</h3>

<p align="center">
  Find a trial. Prove you qualify. <em>Reveal nothing else.</em>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#license">License</a>
</p>

---

## Overview

**Veil** is a privacy-first clinical trial screener built for the [Midnight Network Hackathon](https://midnight.network). Patients upload their medical records, get AI-matched to relevant trials, and cryptographically prove their eligibility — all **without ever transmitting personal health information (PHI)** to a server.

> **Hackathon Demo Note:** This is a proof-of-concept sample project. While the application queries the live ClinicalTrials.gov API and can technically search for any condition, the included mock medical records (PDFs) are specifically tailored for **Breast Cancer** and **Type 2 Diabetes**. For the best end-to-end evaluation experience, please search for these conditions when testing.

The entire pipeline — PDF extraction, AI matching, eligibility screening — runs **client-side in the browser**. The only data that leaves the device is a zero-knowledge proof attesting to eligibility.

## Features

- **AI-Powered PDF Extraction** — Upload a medical summary PDF and Gemini Flash extracts structured patient data (age, sex, conditions, medications, biomarkers) directly in the browser.
- **Trial Discovery** — Queries ClinicalTrials.gov v2 API to find actively recruiting studies matching the patient's condition and region.
- **Eligibility Screening** — Gemini evaluates each trial's inclusion/exclusion criteria against the patient's profile, returning per-criterion verdicts with confidence scores.
- **Zero-Knowledge Proofs** — A Midnight Network Compact contract proves eligibility on-chain without revealing any underlying health data.
- **Client-Side Privacy** — All data processing happens locally. Zero bytes of PHI are transmitted. Records never leave the device.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                         │
│                                                                 │
│  ┌──────────┐   ┌──────────────┐   ┌───────────────────────┐   │
│  │  PDF      │──▶│  Gemini AI   │──▶│  Patient Profile      │   │
│  │  Upload   │   │  Extraction  │   │  (stays on device)    │   │
│  └──────────┘   └──────────────┘   └───────────┬───────────┘   │
│                                                 │               │
│  ┌──────────────────────────────────────────────▼────────────┐  │
│  │          ClinicalTrials.gov v2 API                        │  │
│  │          (public, no PHI sent)                             │  │
│  └──────────────────────────────────────────────┬────────────┘  │
│                                                 │               │
│  ┌──────────────┐   ┌───────────────────────────▼────────────┐  │
│  │  Gemini AI   │◀──│  Trial Matches                         │  │
│  │  Screening   │──▶│  Eligibility Verdicts                  │  │
│  └──────────────┘   └───────────────────────────┬────────────┘  │
│                                                 │               │
│  ┌──────────────────────────────────────────────▼────────────┐  │
│  │  Midnight ZK Proof (Compact Circuit)                      │  │
│  │  Proves eligibility on-chain · reveals nothing else       │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A free **Gemini API key** from [Google AI Studio](https://aistudio.google.com/app/api-keys)

### Installation

```bash
# Clone the repository
git clone https://github.com/Arctic-AES/Veil.git
cd Veil

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
```

Open `.env` and add your Gemini API key:

```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
VITE_CT_API_BASE=https://clinicaltrials.gov/api/v2
```

### Running

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
npm run preview
```

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript 6, Vite 8 |
| **AI / LLM** | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| **PDF Parsing** | `pdfjs-dist` (client-side) |
| **Data Validation** | Zod 4 (runtime schema validation) |
| **Clinical Data** | ClinicalTrials.gov v2 REST API |
| **Zero-Knowledge** | Midnight Network Compact language |
| **Styling** | CSS Modules, CSS custom properties |

## Project Structure

```
src/
├── ai/                  # Gemini AI modules
│   ├── extractPatient.ts    # PDF → structured patient data
│   ├── matchTrials.ts       # Patient → trial relevance ranking
│   └── screenEligibility.ts # Patient + trial → eligibility verdict
├── api/
│   └── clinicalTrials.ts    # ClinicalTrials.gov v2 API client
├── components/
│   ├── layout/              # TopBar, Stepper, Footer
│   ├── prove/               # ZK proof visualization
│   ├── quiz/                # Onboarding quiz & landing page
│   ├── trial/               # Trial cards
│   ├── ui/                  # Button, Card, Tag, ScoreRing, etc.
│   └── verify/              # Records import, screening panels
├── hooks/
│   └── useFlow.ts           # Flow context hook
├── pages/
│   ├── QuizPage.tsx         # Step 1: Condition quiz + landing
│   ├── MatchesPage.tsx      # Step 2: Trial matches
│   ├── VerifyPage.tsx       # Step 3: Upload records & screen
│   └── ProvePage.tsx        # Step 4: Generate ZK proof
├── services/
│   ├── walletClient.ts      # Lace wallet connection (stub)
│   └── zkProver.ts          # ZK proof generation (stub)
├── shared/
│   └── types.ts             # Zod schemas + TypeScript types
├── state/
│   ├── FlowContext.tsx      # React context provider
│   └── flowReducer.ts       # App state reducer
├── styles/
│   ├── tokens.css           # Design tokens (colors, radii, fonts)
│   └── globals.css          # Global resets & animations
└── zk/
    └── midnight.ts          # Midnight Network integration

contracts/
└── eligibility.compact      # Midnight Compact ZK circuit
```

## How It Works: Step-by-Step Walkthrough

### Step 1 — Quiz (Landing Page)

**Where:** `http://localhost:5173`

When you open Veil, you see a three-question quiz:

| Question | What it does |
|---|---|
| **Medical condition** | Used as the search keyword for ClinicalTrials.gov (e.g. "Breast Cancer") |
| **Location / region** | Filters results to recruiting trials near your area (e.g. "Georgia, USA") |
| **Priority** | Tells the AI what matters most to you (speed, proximity, innovation) |

> **No data is saved.** Your answers live only in memory in your browser tab. Closing the tab wipes everything.

Once you hit **"Find trials for me"**, the app calls the live [ClinicalTrials.gov v2 API](https://clinicaltrials.gov/api/v2/studies) with your condition and region as search parameters.

### Step 2 — Preliminary Matches

**Where:** Matches page

You'll see a list of recruiting clinical trials returned by ClinicalTrials.gov, filtered by your condition and location. The stats bar shows:

| Stat | Meaning |
|---|---|
| **Trials searched** | The actual total number of trials returned by the API query for your condition & region |
| **Match rate** | The % of the total pool that was narrow enough to show you (shown results ÷ total found) |
| **AI model** | The Gemini model used for all AI tasks in this session |

> **Important:** These are **preliminary matches only**. The AI has not read your records yet. These are based purely on your 3 quiz answers. A trial appearing here does NOT mean you are eligible.

> **Note on Locations:** The ClinicalTrials.gov API uses your region as a keyword search, not a strict geographic filter. Some multi-site trials list locations across multiple countries and still appear. Always check the trial's site list before applying.

**Tap any trial** to begin private eligibility verification.

### Step 3 — Verify Privately

**Where:** Verify page

This is the core privacy step. Everything here runs **on your device only**.

#### Left panel: Connect & Import

**Wallet Connection**
- Click **"Connect Lace"** to connect your Midnight Network wallet.
- The app checks if the **Lace browser extension** is installed. If it's not, you'll see an error telling you to install it.
- The wallet is needed to generate a cryptographic proof in Step 4.

**Importing Your Records**
- Click **"Import records to this browser"** or **"Choose records"**.
- You can select **one or more PDFs** (lab reports, doctor's summaries, discharge notes, etc.).
- If you upload multiple files, Veil reads each one separately with Gemini and **merges them** into a single patient profile, combining conditions, medications, and biomarkers from all documents.
- Supported formats: **PDF, FHIR JSON, CCDA XML, CSV**.
- Your files are **never uploaded** — they are read as binary data in your browser, converted to base64, and sent directly to the Gemini API from your browser. They are not routed through any Veil server.

> Open your browser DevTools → Network tab while importing. You will see zero requests to any Veil server.

> **Note on Multiple Files:** You can click "Choose records" and select multiple files at once. Veil will extract data from each one and merge them into a single patient profile before screening.

#### Right panel: AI Screening

Once records are loaded, the AI starts automatically.

**How it works**
1. The app parses the trial's eligibility criteria text into **Inclusion** and **Exclusion** lists.
2. Your merged patient profile (from the PDF) is sent to **Gemini 2.5 Flash** along with the criteria.
3. Gemini evaluates each criterion against your data and returns a structured result.

**Understanding the Results**

*Criterion types:*
- `MUST MEET` (blue) — **Inclusion criterion** — you must satisfy this to be eligible.
- `MUST NOT HAVE` (red) — **Exclusion criterion** — if you have this condition, you're disqualified.

*Result icons:*
- `✓ Pass` (green) — For inclusion: you meet this requirement. For exclusion: you don't have the disqualifying condition. Either way — this is GOOD.
- `✗ Fail` (red) — For inclusion: you don't meet this requirement. For exclusion: you DO have the disqualifying condition. This is BAD.
- `? Not enough info` (amber) — The AI could not find enough information in your records to make a determination. This does NOT automatically disqualify you — it just means the data wasn't there.

*Confidence score:*
The confidence score (0–100%) reflects how certain the AI is about its **final eligibility decision** — NOT how good or bad your result is.
- **100% confidence** = the AI had clear, unambiguous answers for all criteria.
- **Low confidence (e.g. 40%)** = many criteria had `Not enough info` — the AI couldn't find the data needed to make a firm decision.

> **Note on Confidence:** If your confidence is 60% but you're marked eligible, it means the AI is 60% sure you're eligible — likely because several criteria returned "Not enough info." Consider uploading additional records (lab results, specialist reports) to give the AI more data to work with.

*Final verdict:*
- ✓ **Likely eligible** — All inclusion criteria passed and no exclusion criteria were triggered.
- ✗ **Likely not eligible** — One or more inclusion criteria failed, or an exclusion criterion was triggered.

> **Note on Switching Trials:** Clicking "Switch trial" takes you back to the matches list. Selecting a new trial automatically clears the previous screening result and starts a fresh scan.

### Step 4 — Generate Proof

**Where:** Prove page

If you are deemed eligible, the app generates a **zero-knowledge (ZK) proof** using the Midnight Network protocol.

- The proof mathematically certifies: *"This patient meets the eligibility criteria for [Trial ID]"*
- **No medical data is included in the proof.** Only the yes/no conclusion is encoded.
- The proof is signed with your Lace wallet and can be submitted to the trial sponsor on-chain.
- The trial sponsor learns only: *"Someone is eligible"* — they never learn who you are or what your records contain.

## License

This project is licensed under the [MIT License](LICENSE).
