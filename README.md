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

The entire pipeline — PDF extraction, AI matching, eligibility screening — runs **client-side in the browser**. The only data that leaves the device is a zero-knowledge proof attesting to eligibility.

## Features

- 🩺 **AI-Powered PDF Extraction** — Upload a medical summary PDF and Gemini Flash extracts structured patient data (age, sex, conditions, medications, biomarkers) directly in the browser.
- 🔍 **Trial Discovery** — Queries ClinicalTrials.gov v2 API to find actively recruiting studies matching the patient's condition and region.
- ✅ **Eligibility Screening** — Gemini evaluates each trial's inclusion/exclusion criteria against the patient's profile, returning per-criterion verdicts with confidence scores.
- 🔐 **Zero-Knowledge Proofs** — A Midnight Network Compact contract proves eligibility on-chain without revealing any underlying health data.
- 🛡️ **Client-Side Privacy** — All data processing happens locally. Zero bytes of PHI are transmitted. Records never leave the device.

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

## How It Works

1. **Quiz** — The patient answers 3 quick questions (condition, region, priority) to seed trial discovery.
2. **Match** — Veil queries ClinicalTrials.gov and uses Gemini to rank trials by relevance.
3. **Verify** — The patient uploads their medical PDF. Gemini extracts structured data and evaluates eligibility against each trial's criteria — all client-side.
4. **Prove** — A Midnight Compact circuit generates a zero-knowledge proof that the patient meets the trial's requirements, without revealing any health data. This proof is submitted on-chain.

## License

This project is licensed under the [MIT License](LICENSE).
