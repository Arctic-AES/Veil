/**
 * Trial search + AI ranking.
 * Wraps friend's real ClinicalTrials.gov fetcher (src/api/clinicalTrials)
 * and his Gemini ranker (src/ai/matchTrials). Falls back to raw search
 * if no patient has been loaded yet (i.e. for the preliminary matches step).
 */
import type { PatientFields, TrialMatch } from '../shared/types'
import { searchTrials as fetchTrials } from '../api/clinicalTrials'
import { matchTrials as rankTrials } from '../ai/matchTrials'

export type TrialSearchQuery = {
  condition?: string
  region?: string
  status?: string
}

export async function searchTrials(query: TrialSearchQuery): Promise<TrialMatch[]> {
  const condition = query.condition?.trim()
  if (!condition) return []
  return fetchTrials(condition)
}

/** Optional second pass: re-rank with Gemini once we have patient data. */
export async function rankTrialsWithPatient(
  patient: PatientFields,
  trials: TrialMatch[],
): Promise<TrialMatch[]> {
  return rankTrials(patient, trials)
}
