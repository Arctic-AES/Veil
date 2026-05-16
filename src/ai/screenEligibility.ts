import { GoogleGenerativeAI } from '@google/generative-ai';
import { PatientFields, TrialMatch, EligibilityResult, EligibilityResultSchema } from '../shared/types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || '');

export async function screenEligibility(
    patient: PatientFields,
    trial: TrialMatch,
    criteria: { inclusion: string[], exclusion: string[] }
): Promise<EligibilityResult> {

    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    You are an expert clinical trial screener.
    Evaluate if the patient meets the criteria for this trial.

    Patient Profile:
    ${JSON.stringify(patient, null, 2)}

    Trial: ${trial.title}

    Inclusion Criteria (MUST be met):
    ${JSON.stringify(criteria.inclusion, null, 2)}

    Exclusion Criteria (MUST NOT be met):
    ${JSON.stringify(criteria.exclusion, null, 2)}

    Evaluate EACH criterion individually.
    If insufficient information, set "met" to null.
    Set "isEligible" to true ONLY IF all inclusion criteria are met (true) AND no exclusion criteria are met.

    Return a JSON object with this EXACT structure (schema-validated):
    {
        "nctId": "${trial.nctId}",
        "isEligible": true,
        "confidenceScore": 95,
        "criteriaAnalysis": [
            {
                "criterion": "The exact text of the criterion",
                "met": true,
                "reasoning": "Brief explanation"
            }
        ]
    }

    Field names MUST be: nctId, isEligible, confidenceScore, criteriaAnalysis, criterion, met, reasoning.
    Do not use: eligible, reason, trialId.
    Return ONLY the JSON, no markdown fences.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
    const rawObject = JSON.parse(cleanJson);

    return EligibilityResultSchema.parse(rawObject);
}
