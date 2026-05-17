
import type { PatientFields, TrialMatch, EligibilityResult } from '../shared/types'
import { parseCriteria } from '../api/parseCriteria'
import { screenEligibility } from '../ai/screenEligibility'

export async function analyzeEligibility(
  patient: PatientFields,
  trial: TrialMatch,
): Promise<EligibilityResult> {
  const criteria = parseCriteria(trial.eligibilityCriteria)
  return screenEligibility(patient, trial, criteria)
}
