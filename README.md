# Veil

Private clinical trial screening built on the Midnight blockchain.

---

## What it does

Veil lets patients find clinical trials and verify their eligibility without sharing their medical records with anyone. The screening runs in the browser, and the only thing submitted to the blockchain is a cryptographic proof that the patient qualifies. The actual health data stays on the device.

---

## How it works

**Step 1 — Pick your condition**

The app asks three questions: what condition you are exploring, what region you are in, and what your priority is. Those answers are used to search ClinicalTrials.gov and pull a list of recruiting trials.

**Step 2 — Review matches**

Results are ranked by a match score calculated locally using keyword comparison between your condition and each trial's title and listed conditions. No patient records are involved at this stage.

**Step 3 — Screen against a trial**

After selecting a trial, you connect a Lace wallet and load your medical records by uploading a PDF or using a built-in demo patient. The AI evaluates each of the trial's eligibility criteria one by one, entirely in the browser. Each criterion comes back as Pass, Fail, or "Not enough info." If a criterion is marked unknown because it was not documented in the records, the patient can manually override it. The demo patients have nine out of ten criteria passing with one left undocumented so the override can be demonstrated.

**Step 4 — Generate the proof**

Once all criteria pass, the app generates a zero-knowledge proof. The patient's eligibility score and the trial's minimum threshold are run through a cryptographic circuit in the browser. The circuit checks whether the score meets the threshold and outputs only a boolean result. The actual numbers are not disclosed. The proof is signed and verified locally, then submitted through Lace to the Midnight blockchain. What gets recorded on-chain is the trial ID and whether the patient is eligible.

---

## Running it

**Requirements**

- Node.js 18 or higher
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikeys), only needed for importing real PDFs. The demo patients work without one.
- Lace wallet from [lace.io](https://www.lace.io/), only needed for on-chain submission.

**Setup**

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

```bash
npm run dev
```

Run the Midnight proof server, then set Lace to use it under Settings, Midnight, Local:

```bash
docker run -p 6300:6300 midnightntwrk/proof-server:8.0.3 midnight-proof-server -v
```

---

## The ZK contract

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

`patientScore` and `trialRequirement` are private inputs. The only value written to the ledger is whether the score met the threshold.

---

## Tech stack

| | |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| AI | Google Gemini 2.5 Flash |
| Trials data | ClinicalTrials.gov v2 API |
| ZK proof | Midnight Compact, compact-runtime (WASM) |
| Wallet | Lace via Midnight DApp connector |
| Commitment | SHA-256 via Web Crypto API |

---

## License

[MIT](LICENSE)
