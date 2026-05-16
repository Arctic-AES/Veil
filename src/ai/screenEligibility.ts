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

    You must evaluate EACH criterion individually.
    If you don't have enough information to know if they meet a criterion, set "met" to null.
    Set "eligible" to true ONLY IF all inclusion criteria are met (true) AND NO exclusion criteria are met (false).

    Return a JSON object with this EXACT structure:
    {
        "trialId": "${trial.nctId}",
        "eligible": true,
        "confidenceScore": 0, // Number from 0 to 100 based on how many criteria were null
        "criteriaAnalysis": [
            {
                "criterion": "The text of the criterion",
                "met": true, // true, false, or null
                "reason": "Brief explanation"
            }
        ]
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanJson = responseText.replace(/```json\n?|\n?```/g, '');
        const rawObject = JSON.parse(cleanJson);

        const validatedResult = EligibilityResultSchema.parse(rawObject);

        return validatedResult;

    } catch (error) {
        console.error("Eligibility Screening Failed:", error);
        throw new Error("Failed to screen patient eligibility.");
    }
}
