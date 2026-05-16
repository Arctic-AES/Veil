/**
 * ZK proof generator (Midnight / Compact circuit).
 * Stub now — replace with MidnightJS proof gen when circuit is ready.
 */
import {
  ZKProofPayloadSchema,
  type EligibilityResult,
  type ZKProofPayload,
} from '../shared/types'

export type ProofProgress = {
  step: 'witness' | 'compile' | 'prove' | 'submit'
  ms: number
}

export async function generateProof(
  result: EligibilityResult,
  onProgress?: (p: ProofProgress) => void,
): Promise<ZKProofPayload> {
  // TODO: real flow:
  //   1. Build witness from PatientFields
  //   2. Load compiled circuit
  //   3. snarkjs.groth16.fullProve(witness, wasm, zkey)
  //   4. Submit to Midnight via @midnight-ntwrk/midnight-js
  const steps: ProofProgress[] = [
    { step: 'witness', ms: 600 },
    { step: 'compile', ms: 900 },
    { step: 'prove', ms: 1400 },
    { step: 'submit', ms: 800 },
  ]
  for (const s of steps) {
    await new Promise((r) => setTimeout(r, s.ms))
    onProgress?.(s)
  }
  return ZKProofPayloadSchema.parse({
    trialId: result.nctId,
    eligible: result.isEligible,
    proofBytes: '0x1f2a9b4c8e7d3f6a' + crypto.randomUUID().replace(/-/g, ''),
  })
}
