<p align="center">
  <strong style="font-size:2em;">VE<span style="color:#2563eb">I</span>L</strong>
</p>

<h3 align="center">Private Clinical Trial Screening</h3>

<p align="center">
  Find a trial. Screen your records. Prove eligibility — <em>without revealing your health data.</em>
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#privacy-model">Privacy</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#project-structure">Structure</a> •
  <a href="#license">License</a>
</p>

---

## Overview

**Veil** is a privacy-first clinical trial screener built for the [Midnight Network Hackathon](https://midnight.network). Patients can:

1. **Discover** actively recruiting trials via the live [ClinicalTrials.gov](https://clinicaltrials.gov) v2 API.
2. **Screen** their medical records against a trial's inclusion and exclusion criteria — AI runs in the browser, nothing touches a Veil server.
3. **Prove eligibility on Midnight** — the compiled `Eligibility` contract runs in-browser via `@midnight-ntwrk/compact-runtime` (WASM), producing `proofData` for each circuit. A `veil-commitment-v1` package binds SHA-256 record hashes, the screening witness, and a nullifier. Only a single boolean — *eligible or not* — is disclosed on-ledger.

There is **no Veil backend**. All state lives in the browser tab.

> **Demo path:** Search **Breast Cancer** or **Type 2 Diabetes**, select any recruiting trial, load a demo patient, override the one undocumented criterion, then generate the proof. Full PDF import and live AI screening require a Gemini API key.

### Implementation status

| Capability | Status |
|---|---|
| Live trial search — ClinicalTrials.gov v2 | ✅ |
| PDF → structured patient profile (Gemini 2.5 Flash) | ✅ Requires API key |
| Per-criterion eligibility screening (Gemini 2.5 Flash) | ✅ Requires API key; demo rules without key |
| Local SHA-256 eligibility commitment + record hashes | ✅ |
| Compact contract compiled to `contracts/managed/` | ✅ `npm run compact` |
| In-browser circuit execution + `proofData` per circuit | ✅ `@midnight-ntwrk/compact-runtime` + WASM |
| Lace wallet — `@midnight-ntwrk/dapp-connector-api`, `preprod`, demo fallback | ✅ |
| Balanced tx submit to Preprod | ⏳ Lace + Docker proof server (see below) |

---

## Privacy model

Veil is designed so **no PHI passes through a Veil server** — because there is no Veil server.

| Data | Where it goes |
|---|---|
| Quiz answers | Browser memory only |
| Trial metadata | ClinicalTrials.gov (public API, no PHI) |
| PDF files | Read in browser → base64 → **Google Gemini API** for extraction |
| Patient profile + criteria | **Google Gemini API** when a key is configured |
| Eligibility commitment + `proofData` | Built and verified **in the browser** |
| Wallet | `window.midnight.mnLace` on `preprod` |

**Open DevTools → Network** to verify: no requests to a Veil domain. With a Gemini key you will see requests to `generativelanguage.googleapis.com`. For full ZK proving, run the [Midnight proof server](https://docs.midnight.network/getting-started/installation) on Docker port `6300` and point Lace → Settings → Midnight → Local.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER (client only)                       │
│                                                                     │
│  Step 1 — Quiz                                                       │
│  condition · region · priority  ──▶  React state (tab memory)       │
│                                                                     │
│  Step 2 — Matches                                                    │
│  ClinicalTrials.gov v2  ◀──  query.cond + query.locn                │
│  Local Jaccard score ranks results (no AI, no PHI)                  │
│                                                                     │
│  Step 3 — Verify                                                     │
│  ┌────────────┐    ┌──────────────────┐    ┌──────────────────────┐ │
│  │ PDF upload │───▶│ Gemini 2.5 Flash │───▶│ PatientFields        │ │
│  │ (or Demo)  │    │ extract + screen │    │ + SHA-256 PDF hashes │ │
│  └────────────┘    └──────────────────┘    └──────────┬───────────┘ │
│                                                       │             │
│  Step 4 — Prove                                       ▼             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Midnight Compact: initTrial → proveEligibility             │    │
│  │  proofData per circuit (WASM runtime, in-browser)           │    │
│  │  veil-commitment-v1: record hashes + criteria root          │    │
│  │  Lace (preprod) · proof server optional (:6300)             │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **Gemini API key** — [Google AI Studio](https://aistudio.google.com/app/apikeys) (required for PDF import and live screening)
- **Lace wallet** with Midnight / Preprod — [Chrome extension](https://www.lace.io/)
- **Compact compiler** (to recompile contracts) — [Midnight docs](https://docs.midnight.network/getting-started/installation)
- **Docker** (optional, for full on-chain ZK proving) — `midnightntwrk/proof-server:8.0.3` on port `6300`

### Installation

```bash
git clone https://github.com/Arctic-AES/Veil.git
cd Veil
npm install
cp .env.example .env
```

Edit `.env`:

```env
VITE_GEMINI_API_KEY=your_key_here
VITE_CT_API_BASE=https://clinicaltrials.gov/api/v2/studies
VITE_MIDNIGHT_NETWORK=preprod
VITE_PROOF_SERVER_URL=http://localhost:6300
```

### Compile the Compact contract

```bash
npm run compact
# compact compile contracts/eligibility.compact contracts/managed/eligibility
```

Compiled artifacts are committed under `contracts/managed/eligibility/` so judges can run without installing the Compact compiler.

### Proof server (optional)

```bash
docker run -p 6300:6300 midnightntwrk/proof-server:8.0.3 midnight-proof-server -v
```

In Lace: **Settings → Midnight → Local** (`http://localhost:6300`).

### Run

```bash
npm run dev       # http://localhost:5173
npm run build     # production build
npm run preview   # preview build
```

---

## How it works

### Step 1 — Quiz

Three questions stored in browser memory only:

| Question | Used for |
|---|---|
| **Medical condition** | `query.cond` on ClinicalTrials.gov |
| **Region** | `query.locn` keyword filter |
| **Priority** | UI display only |

### Step 2 — Preliminary matches

- Up to 10 recruiting / not-yet-recruiting studies returned from ClinicalTrials.gov v2.
- Ranked locally by a Jaccard-style token overlap score between the quiz condition and each trial's title and conditions — no patient records, no AI.
- **Top match %** reflects keyword overlap only, not clinical eligibility.

### Step 3 — Verify privately

**Wallet:** Connect Lace on `preprod` via `@midnight-ntwrk/dapp-connector-api`. Falls back to a session demo address if Lace is not installed. A wallet address is required — it anchors the nullifier (SHA-256 of wallet + trial ID) to reduce double-submission.

**Import records:**

| Path | Requires | Notes |
|---|---|---|
| **Import PDF** | `VITE_GEMINI_API_KEY` | File stays in browser; Gemini extracts structured fields |
| **Demo Patients** | Nothing | Sarah Jenkins (HER2+ breast cancer) or Marcus Vance (T2DM) |

- Multiple PDFs are extracted in parallel and merged (deduplicated conditions / medications / biomarkers).
- Each file's raw bytes are hashed (SHA-256) into `documentHashes` for the commitment step.
- Demo patients carry clinically detailed profiles designed to satisfy the majority of criteria for their respective trial types.

**Screening** runs automatically once a patient and trial are loaded:

1. Trial eligibility text is split into inclusion and exclusion lists.
2. Gemini 2.5 Flash evaluates each criterion individually. Without an API key and with a demo patient, a local rules-based screener runs instead.
3. Per-criterion results: **Pass**, **Fail**, or **? Not enough info**.

Unknown criteria can be manually overridden — the patient attests they meet the requirement even though it isn't documented in the records on file. One criterion in each demo profile is intentionally left undocumented to demonstrate this flow.

**Continue to Step 4** requires: wallet connected, patient loaded, all criteria passing or overridden.

### Step 4 — Midnight eligibility proof

1. **Witness** — `patientScore` and `trialRequirement` are derived from the criterion verdicts.
2. **Compact** — `initTrial(trialIdHash)` then `proveEligibility(patientScore, trialRequirement)` run against the compiled `Eligibility` contract via `@midnight-ntwrk/compact-runtime` + WASM, entirely in-browser, producing serialized `proofData` per circuit.
3. **Commitment** — a `veil-commitment-v1` JSON package is assembled: salted patient commitment, per-file record hashes, criteria Merkle root (hash chain over per-criterion verdicts), nullifier, and a SHA-256 signature over all fields.
4. **Verify** — the commitment signature is verified locally before the proof package is finalized.

What the on-ledger `Eligibility` contract stores:

| Field | Visibility |
|---|---|
| `trialId` | Public |
| `isEligible` | Public — `disclose(patientScore >= trialRequirement)` |
| `patientScore` | Private (witness input only) |
| `trialRequirement` | Private (witness input only) |

The proof package includes serialized `proofData` for both circuits, ready for the Midnight proof server and Lace tx submission.

---

## Compact contract

```compact
pragma language_version >= 0.20;

import CompactStandardLibrary;

export ledger trialId: Bytes<32>;
export ledger isEligible: Boolean;

export circuit initTrial(publicTrialId: Bytes<32>): [] {
  trialId = disclose(publicTrialId);
  isEligible = false;
}

export circuit proveEligibility(
  patientScore: Uint<32>,
  trialRequirement: Uint<32>,
): [] {
  isEligible = disclose(patientScore >= trialRequirement);
}
```

Patient score and trial requirement are private witness inputs. Only the boolean eligibility result is disclosed on-ledger.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 8 |
| AI | Google Gemini 2.5 Flash — extraction and per-criterion screening |
| Trials API | ClinicalTrials.gov v2 REST |
| Commitment | Web Crypto SHA-256 |
| ZK contract | Midnight Compact + `@midnight-ntwrk/compact-runtime` (WASM) |
| Wallet | Lace via `@midnight-ntwrk/dapp-connector-api` |
| Validation | Zod 4 |
| Styling | CSS Modules, design tokens |

---

## Project structure

```
src/
├── ai/
│   ├── extractPatient.ts       # PDF → PatientFields (Gemini)
│   ├── screenEligibility.ts    # Profile + trial → EligibilityResult
│   └── matchTrials.ts
├── api/
│   ├── clinicalTrials.ts       # ClinicalTrials.gov fetch
│   ├── parseCriteria.ts        # Inclusion / exclusion text split
│   └── scoring.ts              # Local preliminary match score
├── components/                 # UI by flow step
├── hooks/                      # useFlow, usePatientImport, useEligibility, useZkProof …
├── lib/
│   ├── fileHash.ts             # SHA-256 of uploaded PDF bytes
│   └── eligibilityVerdict.ts   # Pass/fail/unknown aggregation
├── midnight/
│   ├── compactEligibility.ts   # initTrial + proveEligibility via compact-runtime
│   ├── proofServer.ts          # localhost:6300 health check
│   └── witnesses.ts
├── pages/
│   ├── QuizPage.tsx
│   ├── MatchesPage.tsx
│   ├── VerifyPage.tsx
│   └── ProvePage.tsx
├── services/
│   ├── geminiClient.ts         # Screening orchestration
│   ├── zkProver.ts             # Witness + circuits + commitment
│   └── laceWallet.ts           # Lace DApp connector
├── state/                      # FlowContext + reducer
├── zk/
│   └── midnight.ts             # Commitment builder (veil-commitment-v1)
└── shared/types.ts             # Zod schemas

contracts/
├── eligibility.compact         # Midnight Compact source
└── managed/eligibility/        # Compiler output (committed)
```

---

## Testing checklist

```bash
npm run dev
```

1. Quiz → **Breast Cancer** or **Type 2 Diabetes** + a US region.
2. Matches → select any recruiting trial.
3. Verify → connect wallet → **Demo Patients** → load Sarah Jenkins or Marcus Vance.
4. Screening runs automatically — criteria come back mostly passing, one is flagged as undocumented → click **Override**.
5. DevTools → Network: `generativelanguage.googleapis.com` with an API key; no Veil host either way.
6. Prove → **Generate Midnight proof** → watch the four proof steps complete → inspect the commitment and the "What each side sees" comparison.
7. Connect Lace for full on-chain submission (requires proof server on `:6300`).

---

## License

[MIT](LICENSE)
