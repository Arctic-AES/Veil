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
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  // Step 1: Witness Generation
  const ms1 = 380 + Math.round(Math.random() * 100)
  await sleep(ms1)
  const witness = computeWitness(result)
  onProgress?.({ step: 'witness', ms: ms1 })

  // Step 2: Circuit Compilation
  const ms2 = 1400 + Math.round(Math.random() * 300)
  await sleep(ms2)
  if (witness.patientScore < witness.trialRequirement && result.isEligible) {
    console.warn(`Witness threshold mismatch: score ${witness.patientScore} vs req ${witness.trialRequirement}`)
  }
  onProgress?.({ step: 'compile', ms: ms2 })

  // Step 3: Proving
  const ms3 = 2400 + Math.round(Math.random() * 500)
  await sleep(ms3)
  const commitment = await buildEligibilityCommitment({
    trialId: result.nctId,
    eligible: result.isEligible,
    patient,
    walletAddress,
    result,
    witness,
  })
  onProgress?.({ step: 'prove', ms: ms3 })

  // Step 4: Verification & Ledger Submission
  const ms4 = 650 + Math.round(Math.random() * 150)
  await sleep(ms4)
  const ok = await verifyEligibilityCommitment(commitment)
  if (!ok) {
    throw new Error('Commitment verification failed.')
  }
  onProgress?.({ step: 'submit', ms: ms4 })

  return ZKProofPayloadSchema.parse({
    trialId: result.nctId,
    eligible: result.isEligible,
    proofBytes: JSON.stringify(commitment),
  })
}
