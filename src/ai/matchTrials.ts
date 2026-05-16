import { GoogleGenerativeAI } from '@google/generative-ai';
import type { PatientFields, TrialMatch } from '../shared/types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || '');

export async function matchTrials(patient: PatientFields, trials: TrialMatch[]): Promise<TrialMatch[]> {
    if (trials.length === 0) return [];

    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: { responseMimeType: "application/json" }
    });


    const trialsInput = trials.map(t => ({
        nctId: t.nctId,
        title: t.title,
        conditions: t.conditions,
        eligibilityCriteria: t.eligibilityCriteria.substring(0, 500)
    }));

    const prompt = `
    You are an expert clinical trial specialist. I have a patient profile and a list of clinical trials.
    You need to give each trial a "relevanceScore" from 0 to 100 indicating how well the patient matches the trial's basic conditions.

    Patient Profile:
    ${JSON.stringify(patient, null, 2)}

    Trials List:
    ${JSON.stringify(trialsInput, null, 2)}

    Return a JSON array of objects with EXACTLY this structure, one for each trial:
    [
        {
            "nctId": "string",
            "relevanceScore": 0
        }
    ]
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        const cleanJson = responseText.replace(/```json\n?|\n?```/g, '');
        const scores: { nctId: string, relevanceScore: number }[] = JSON.parse(cleanJson);

        const scoredTrials = trials.map(trial => {
            const scoreObj = scores.find(s => s.nctId === trial.nctId);
            return {
                ...trial,
                relevanceScore: scoreObj ? scoreObj.relevanceScore : 0
            };
        });

        // Filter out trials made by Gemini AI assumptions.
        return scoredTrials
            .filter(t => t.relevanceScore !== undefined && t.relevanceScore >= 30)
            .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    } catch (error) {
        console.error("Trial Matching Failed:", error);
        return [];
    }
}
