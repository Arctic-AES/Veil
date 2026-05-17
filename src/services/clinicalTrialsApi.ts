
import type { TrialMatch } from '../shared/types'
import { searchTrials as fetchTrials } from '../api/clinicalTrials'

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
