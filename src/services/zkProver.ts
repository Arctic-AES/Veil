import {
  ZKProofPayloadSchema,
  type EligibilityResult,
  type PatientFields,
  type ZKProofPayload,
} from '../shared/types'
import {
  buildEligibilityCommitment,
  computeWitness,
  verifyEligibilityCommitment,
} from '../zk/midnight'

export type ProofProgress = {
  step: 'witness' | 'compile' | 'prove' | 'submit'
  ms: number
}

export async function generateProof(
  result: EligibilityResult,
  patient: PatientFields,
  walletAddress: string,
  onProgress?: (p: ProofProgress) => void,
): Promise<ZKProofPayload> {
  const t1 = performance.now()
  const witness = computeWitness(result)
  onProgress?.({ step: 'witness', ms: Math.max(10, Math.round(performance.now() - t1)) })

  const t2 = performance.now()
  if (witness.patientScore < witness.trialRequirement && result.isEligible) {
    console.warn(`Witness threshold mismatch: score ${witness.patientScore} vs req ${witness.trialRequirement}`)
  }
  onProgress?.({ step: 'compile', ms: Math.max(10, Math.round(performance.now() - t2)) })

  const t3 = performance.now()
  const commitment = await buildEligibilityCommitment({
    trialId: result.nctId,
    eligible: result.isEligible,
    patient,
    walletAddress,
    result,
    witness,
  })
  onProgress?.({ step: 'prove', ms: Math.max(10, Math.round(performance.now() - t3)) })

  const t4 = performance.now()
  const ok = await verifyEligibilityCommitment(commitment)
  if (!ok) {
    throw new Error('Commitment verification failed.')
  }
  onProgress?.({ step: 'submit', ms: Math.max(10, Math.round(performance.now() - t4)) })

  return ZKProofPayloadSchema.parse({
    trialId: result.nctId,
    eligible: result.isEligible,
    proofBytes: JSON.stringify(commitment),
  })
}
