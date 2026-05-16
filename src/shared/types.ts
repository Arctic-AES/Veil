import { z } from 'zod';

// #1 PATIENT DATA (extracted from PDF)

export const PatientFieldsSchema = z.object({

    age: z.number().int().positive().nullable(),
    // nullable: patient might not have age listed
    sex: z.enum(['male', 'female', 'unknown']),
    // enum: must be exactly one of these strings
    conditions: z.array(z.string()),
    // array of strings: ["Asthma", "Diabetes", "Unknown"]
    medications: z.array(z.string()),
    biomarkers: z.array(z.string()).optional(),
    // optional: key might not exist in the JSON at all

});

export type PatientFields = z.infer<typeof PatientFieldsSchema>;

// #2 TRIAL DATA (from ClinicalTrials.gov)

export const TrialMatchSchema = z.object({

    nctId: z.string(),
    // The unique ID for the trial, e.g., "NCT04567890"
    title: z.string(),
    // The readable name or title of the trial
    status: z.string(),
    // Current status of the trial (e.g., "Recruiting", "Not yet recruiting", "Active, not recruiting")
    conditions: z.array(z.string()),
    // Array of strings representing the medical conditions targeted by the trial.
    eligibilityCriteria: z.string(),
    // Contains inclusion or exclusion rules

});

export type TrialMatch = z.infer<typeof TrialMatchSchema>;

// #3 ELIGIBILITY RESULT (from Gemini API)

export const CriterionResultSchema = z.object({

    criterion: z.string(),
    // The actual text of the inclusion/exclusion criterion from trial document, e.g.,"Must be over 18"
    met: z.boolean().nullable(),
    // true = meets criterion, false = doesn't meet, null = ambiguous
    reasoning: z.string()
    // Gemini's explanation for why it decided "true" or "false"

});

export const EligibilityResultSchema = z.object({

    nctId: z.string(),
    // The unique ID for the trial this is for.
    isEligible: z.boolean(),
    // true = patient is eligible, false = patient is not eligible
    confidenceScore: z.number().min(0).max(100),
    // confidence score: between 0 and 100
    criteriaAnalysis: z.array(CriterionResultSchema),
    // Array of CriterionResult rules. 

});

export type CriterionResult = z.infer<typeof CriterionResultSchema>;
export type EligibilityResult = z.infer<typeof EligibilityResultSchema>;

// #4 ZK Proof Payload (for Blockchain Verification)

export const ZKProofPayloadSchema = z.object({

    trialId: z.string(),
    // The public input for the proof
    eligible: z.boolean(),
    // The public output of the eligibility check
    proofBytes: z.string(),
    // The actual cryptographic proof data

});

export type ZKProofPayload = z.infer<typeof ZKProofPayloadSchema>;


