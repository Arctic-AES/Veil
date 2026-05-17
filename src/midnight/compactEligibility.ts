import {
  createConstructorContext,
  createCircuitContext,
  dummyContractAddress,
  type CircuitResults,
  type ProofData,
} from '@midnight-ntwrk/compact-runtime'
import { encodeCoinPublicKey } from '@midnight-ntwrk/onchain-runtime-v3'
import { Contract } from '../../contracts/managed/eligibility/contract/index.js'
import { eligibilityWitnesses } from './witnesses'
import type { EligibilityWitness } from '../zk/midnight'

export type CompactProveResult = {
  patientScore: bigint
  trialRequirement: bigint
  trialIdBytes: Uint8Array
  initTrial: CircuitResults<Record<string, never>>
  proveEligibility: CircuitResults<Record<string, never>>
  finalLedger: { trialId: Uint8Array; isEligible: boolean }
}

function hexToBytes32(hex: string): Uint8Array {
  const clean = hex.replace(/^0x/, '')
  if (clean.length !== 64) {
    throw new Error(`Expected 32-byte hex, got length ${clean.length}`)
  }
  const out = new Uint8Array(32)
  for (let i = 0; i < 32; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16)
  }
  return out
}

/**
 * Runs the compiled Eligibility Compact contract locally (same logic as on-chain circuit).
 * Returns structured proofData for each circuit — input to Midnight proof server / Lace.
 */
export function runEligibilityCircuits(
  trialIdHashHex: string,
  witness: EligibilityWitness,
): CompactProveResult {
  const contract = new Contract(eligibilityWitnesses)
  const coinPublicKey = { bytes: encodeCoinPublicKey('00'.repeat(32)) }
  const initial = contract.initialState(createConstructorContext({}, coinPublicKey))

  let context = createCircuitContext(
    dummyContractAddress(),
    coinPublicKey,
    initial.currentContractState.data,
    initial.currentPrivateState,
  )

  const trialIdBytes = hexToBytes32(trialIdHashHex)
  const initTrial = contract.circuits.initTrial(context, trialIdBytes)
  context = initTrial.context

  const patientScore = BigInt(witness.patientScore)
  const trialRequirement = BigInt(witness.trialRequirement)
  const proveEligibility = contract.circuits.proveEligibility(
    context,
    patientScore,
    trialRequirement,
  )

  return {
    patientScore,
    trialRequirement,
    trialIdBytes,
    initTrial,
    proveEligibility,
    finalLedger: {
      trialId: trialIdBytes,
      isEligible: patientScore >= trialRequirement,
    },
  }
}

export function summarizeProofData(proofData: ProofData): {
  publicTranscriptLength: number
  privateOutputCount: number
  inputBytes: number
} {
  return {
    publicTranscriptLength: proofData.publicTranscript?.length ?? 0,
    privateOutputCount: proofData.privateTranscriptOutputs?.length ?? 0,
    inputBytes: proofData.input?.value?.length ?? 0,
  }
}
