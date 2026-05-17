import { GoogleGenerativeAI } from '@google/generative-ai'
import { getGeminiApiKey, requireGeminiApiKey } from '../config/env'
import {
  EligibilityResultSchema,
  type PatientFields,
  type TrialMatch,
  type EligibilityResult,
} from '../shared/types'

function patientForPrompt(patient: PatientFields): Omit<PatientFields, 'isDemo'> {
  const { isDemo: _demo, ...profile } = patient
  return profile
}

function screenEligibilityDemo(
  patient: PatientFields,
  trial: TrialMatch,
  criteria: { inclusion: string[]; exclusion: string[] },
): EligibilityResult {
  const isBreastPatient = patient.conditions.some(
    (c) => c.toLowerCase().includes('breast') || c.toLowerCase().includes('carcinoma'),
  )
  const isDiabetesPatient = patient.conditions.some((c) =>
    c.toLowerCase().includes('diabetes'),
  )

  const trialLower = (trial.title + ' ' + (trial.conditions ?? []).join(' ')).toLowerCase()
  const isBreastTrial =
    trialLower.includes('breast') ||
    trialLower.includes('carcinoma') ||
    trialLower.includes('cancer')
  const isDiabetesTrial = trialLower.includes('diabetes') || trialLower.includes('diabetic')

  const isMatch =
    (isBreastPatient && isBreastTrial) || (isDiabetesPatient && isDiabetesTrial)

  const criteriaAnalysis: EligibilityResult['criteriaAnalysis'] = []

  const inclusionList = criteria.inclusion.length > 0
    ? criteria.inclusion
    : ['Patient must have a documented diagnosis consistent with the trial indication.']
  const lastIncIdx = inclusionList.length - 1

  for (let i = 0; i < inclusionList.length; i++) {
    const isLast = i === lastIncIdx
    criteriaAnalysis.push({
      criterion: inclusionList[i],
      type: 'inclusion',
      met: isMatch ? (isLast ? null : true) : false,
      reasoning: isMatch
        ? isLast
          ? 'Not explicitly documented in the available records.'
          : 'Patient profile satisfies this criterion.'
        : 'Patient profile does not document this criterion.',
    })
  }

  for (const ex of criteria.exclusion) {
    criteriaAnalysis.push({
      criterion: ex,
      type: 'exclusion',
      met: isMatch ? false : null,
      reasoning: isMatch
        ? 'Patient profile is negative for this exclusion factor.'
        : 'Insufficient data to evaluate.',
    })
  }

  return EligibilityResultSchema.parse({
    nctId: trial.nctId,
    isEligible: false,
    confidenceScore: isMatch ? 88 : 30,
    criteriaAnalysis,
  })
}

export async function screenEligibility(
  patient: PatientFields,
  trial: TrialMatch,
  criteria: { inclusion: string[]; exclusion: string[] },
): Promise<EligibilityResult> {
  if (patient.isDemo && !getGeminiApiKey()) {
    return screenEligibilityDemo(patient, trial, criteria)
  }

  const genAI = new GoogleGenerativeAI(requireGeminiApiKey())

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  })

  const prompt = `
    You are an expert clinical trial screener.
    Evaluate if the patient meets the criteria for this trial.

    Patient Profile:
    ${JSON.stringify(patientForPrompt(patient), null, 2)}

    Trial: ${trial.title}

    Inclusion Criteria (MUST be met):
    ${JSON.stringify(criteria.inclusion, null, 2)}

    Exclusion Criteria (MUST NOT be met):
    ${JSON.stringify(criteria.exclusion, null, 2)}

    Evaluate EACH criterion individually.
    If insufficient information, set "met" to null — do not guess.
    Set "isEligible" to true ONLY IF all inclusion criteria are met (true) AND no exclusion criteria are met.

    Return a JSON object with this EXACT structure (schema-validated):
    {
        "nctId": "${trial.nctId}",
        "isEligible": true,
        "confidenceScore": 95,
        "criteriaAnalysis": [
            {
                "criterion": "The exact text of the criterion",
                "type": "inclusion",
                "met": true,
                "reasoning": "Brief explanation citing what was or was not found in the profile"
            }
        ]
    }

    Field names MUST be: nctId, isEligible, confidenceScore, criteriaAnalysis, criterion, type, met, reasoning.
    Do not use: eligible, reason, trialId.
    Return ONLY the JSON, no markdown fences.
    `

  const result = await model.generateContent(prompt)
  const responseText = result.response.text()
  const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim()
  const rawObject = JSON.parse(cleanJson)

  return EligibilityResultSchema.parse(rawObject)
}
