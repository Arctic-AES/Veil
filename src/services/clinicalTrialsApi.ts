/**
 * ClinicalTrials.gov v2 client.
 * Real API: https://clinicaltrials.gov/api/v2/studies
 * Returns TrialMatch[] shaped per shared/types.ts
 */
import {
  TrialMatchSchema,
  type TrialMatch,
} from '../shared/types'

const API_BASE =
  import.meta.env.VITE_CT_API_BASE ?? 'https://clinicaltrials.gov/api/v2'

export type TrialSearchQuery = {
  condition?: string
  region?: string
  status?: string
}

const MOCK_TRIALS: TrialMatch[] = [
  {
    nctId: 'NCT04853017',
    title:
      'CDK4/6 Inhibitor + Endocrine Therapy in HER2+ Stage II Breast Cancer',
    status: 'Recruiting',
    conditions: ['Breast Cancer', 'HER2-positive', 'Stage II'],
    eligibilityCriteria:
      'Inclusion: Age 18-65; HER2+ confirmed; Stage II or III breast cancer; Prior chemotherapy allowed. Exclusion: Prior CDK4/6 therapy; ECOG > 2.',
  },
  {
    nctId: 'NCT05121892',
    title:
      'Adjuvant Immunotherapy for Hormone Receptor-Positive Breast Cancer',
    status: 'Recruiting',
    conditions: ['Breast Cancer', 'HR-positive'],
    eligibilityCriteria:
      'Inclusion: Age 18-70; HR+ disease; Post-surgical; ECOG 0-1.',
  },
  {
    nctId: 'NCT04812301',
    title:
      'Targeted Therapy for ESR1-Mutated Metastatic Breast Cancer',
    status: 'Pre-screening',
    conditions: ['Breast Cancer', 'ESR1-mutated', 'Metastatic'],
    eligibilityCriteria:
      'Inclusion: Age 21-75; ER+ disease; ESR1 mutation required.',
  },
]

export async function searchTrials(
  query: TrialSearchQuery,
): Promise<TrialMatch[]> {
  // TODO: replace with real fetch(`${API_BASE}/studies?query.cond=${query.condition}&...`)
  // and map ClinicalTrials.gov response into TrialMatchSchema.
  void API_BASE
  void query
  await new Promise((r) => setTimeout(r, 900))
  return MOCK_TRIALS.map((t) => TrialMatchSchema.parse(t))
}
