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
import { runEligibilityCircuits, summarizeProofData } from '../midnight/compactEligibility'
import { getProofServerHint } from '../midnight/proofServer'
import type { ProofData } from '@midnight-ntwrk/compact-runtime'

export type ProofProgress = {
  step: 'witness' | 'compact' | 'commit' | 'verify'
  ms: number
}

function serializeProofData(data: ProofData): string {
  return JSON.stringify(data, (_key, value) =>
    typeof value === 'bigint' ? value.toString() : value,
  )
}

export async function generateProof(
  result: EligibilityResult,
  patient: PatientFields,
  walletAddress: string,
  documentHashes: string[],
  onProgress?: (p: ProofProgress) => void,
): Promise<ZKProofPayload> {
  const mark = (step: ProofProgress['step'], start: number) => {
    onProgress?.({ step, ms: Math.round(performance.now() - start) })
  }

  const t0 = performance.now()
  const witness = computeWitness(result)
  if (witness.patientScore < witness.trialRequirement && result.isEligible) {
    throw new Error(
      'Screening witness does not satisfy the Compact circuit (score below requirement).',
    )
  }
  if (!result.isEligible) {
    throw new Error('Cannot generate a proof when screening did not pass all criteria.')
  }
  mark('witness', t0)

  const tCompact = performance.now()
  const commitmentDraft = await buildEligibilityCommitment({
    trialId: result.nctId,
    eligible: result.isEligible,
    patient,
    walletAddress,
    result,
    witness,
    documentHashes,
  })

  const compactRun = runEligibilityCircuits(commitmentDraft.trialIdHash, witness)
  if (!compactRun.finalLedger.isEligible) {
    throw new Error('Compact circuit rejected eligibility (score below requirement).')
  }
  const proofServerHint = await getProofServerHint()
  mark('compact', tCompact)

  const t1 = performance.now()
  const commitment: Awaited<ReturnType<typeof buildEligibilityCommitment>> & {
    compact: import('../zk/midnight').CompactProofSummary
  } = {
    ...commitmentDraft,
    compact: {
      protocol: 'midnight-compact-mvp-v1' as const,
      contract: 'eligibility.compact',
      circuits: ['initTrial', 'proveEligibility'] as const,
      patientScore: Number(compactRun.patientScore),
      trialRequirement: Number(compactRun.trialRequirement),
      ledgerIsEligible: compactRun.finalLedger.isEligible,
      initTrial: summarizeProofData(compactRun.initTrial.proofData),
      proveEligibility: summarizeProofData(compactRun.proveEligibility.proofData),
      initTrialProofData: serializeProofData(compactRun.initTrial.proofData),
      proveEligibilityProofData: serializeProofData(compactRun.proveEligibility.proofData),
      proofServerHint,
    },
  }
  mark('commit', t1)

  const t2 = performance.now()
  const ok = await verifyEligibilityCommitment(commitment)
  if (!ok) {
    throw new Error('Commitment verification failed.')
  }
  mark('verify', t2)

  return ZKProofPayloadSchema.parse({
    trialId: result.nctId,
    eligible: result.isEligible,
    proofBytes: JSON.stringify(commitment),
  })
}
