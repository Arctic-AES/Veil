import { z } from 'zod';


export const PatientFieldsSchema = z.object({

    age: z.number().int().positive().nullable(),
    sex: z.enum(['male', 'female', 'unknown']),
    conditions: z.array(z.string()),
    medications: z.array(z.string()),
    biomarkers: z.array(z.string()).optional(),

});

export type PatientFields = z.infer<typeof PatientFieldsSchema>;


export const TrialMatchSchema = z.object({

    nctId: z.string(),
    title: z.string(),
    status: z.string(),
    conditions: z.array(z.string()),
    eligibilityCriteria: z.string(),

});

export type TrialMatch = z.infer<typeof TrialMatchSchema>;


export const CriterionResultSchema = z.object({

    criterion: z.string(),
    type: z.enum(['inclusion', 'exclusion']).optional(),
    met: z.boolean().nullable(),
    reasoning: z.string()

});

export const EligibilityResultSchema = z.object({

    nctId: z.string(),
    isEligible: z.boolean(),
    confidenceScore: z.number().min(0).max(100),
    criteriaAnalysis: z.array(CriterionResultSchema),

});

export type CriterionResult = z.infer<typeof CriterionResultSchema>;
export type EligibilityResult = z.infer<typeof EligibilityResultSchema>;


export const ZKProofPayloadSchema = z.object({

    trialId: z.string(),
    eligible: z.boolean(),
    proofBytes: z.string(),

});

export type ZKProofPayload = z.infer<typeof ZKProofPayloadSchema>;


