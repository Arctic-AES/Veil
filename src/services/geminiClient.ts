/**
 * Eligibility analyzer.
 * Pipeline: parseCriteria splits the trial's raw eligibility text into
 * inclusion/exclusion arrays, then Gemini evaluates each against the patient.
 */
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
