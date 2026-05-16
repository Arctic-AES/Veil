/**
 * Gemini eligibility analyzer.
 * Takes PatientFields + TrialMatch, returns EligibilityResult.
 * Stub now — wire @google/generative-ai with VITE_GEMINI_API_KEY.
 */
import {
  EligibilityResultSchema,
  type EligibilityResult,
  type PatientFields,
  type TrialMatch,
} from '../shared/types'

const _API_KEY = import.meta.env.VITE_GEMINI_API_KEY

export async function analyzeEligibility(
  patient: PatientFields,
  trial: TrialMatch,
): Promise<EligibilityResult> {
  // TODO: import { GoogleGenerativeAI } from '@google/generative-ai'
  // const genAI = new GoogleGenerativeAI(_API_KEY)
  // const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  // const prompt = buildEligibilityPrompt(patient, trial)
  // const result = await model.generateContent(prompt)
  // Parse JSON response into EligibilityResultSchema.
  void _API_KEY
  void patient
  await new Promise((r) => setTimeout(r, 1800))

  return EligibilityResultSchema.parse({
    nctId: trial.nctId,
    isEligible: true,
    confidenceScore: 97,
    criteriaAnalysis: [
      {
        criterion: 'Age 18-65',
        met: true,
        reasoning: 'Patient age 34 falls within range.',
      },
      {
        criterion: 'HER2+ confirmed',
        met: true,
        reasoning: 'Biomarker panel lists HER2+.',
      },
      {
        criterion: 'Stage II or III',
        met: true,
        reasoning: 'Records indicate Stage IIB.',
      },
      {
        criterion: 'No prior CDK4/6 therapy',
        met: true,
        reasoning: 'Medication list shows tamoxifen + anastrozole only.',
      },
      {
        criterion: 'ECOG <= 2',
        met: true,
        reasoning: 'Performance status documented as 0.',
      },
    ],
  })
}
