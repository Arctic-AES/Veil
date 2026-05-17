
import type { PatientFields, TrialMatch } from '../shared/types'
import { searchTrials as fetchTrials } from '../api/clinicalTrials'
import { matchTrials as rankTrials } from '../ai/matchTrials'

export type TrialSearchQuery = {
  condition?: string
  region?: string
  status?: string
}

export async function searchTrials(query: TrialSearchQuery): Promise<{ trials: TrialMatch[]; totalCount: number }> {
  const condition = query.condition?.trim()
  if (!condition) return { trials: [], totalCount: 0 }
  return fetchTrials(condition, query.region)
}


export async function rankTrialsWithPatient(
  patient: PatientFields,
  trials: TrialMatch[],
): Promise<TrialMatch[]> {
  return rankTrials(patient, trials)
}
