import type { EligibilityResult, PatientFields } from '../shared/types'

export type EligibilityWitness = {
    patientScore: number
    trialRequirement: number
}

export type EligibilityCommitment = {
    protocol: 'veil-commitment-v1'
    curve: 'web-crypto-sha-256'
    trialIdHash: string
    eligibleBit: 0 | 1
    patientCommitment: string
    criteriaMerkleRoot: string
    nullifier: string
    nonce: string
    salt: string
    publicInputs: string[]
    signature: string
    timestamp: string
}

const enc = new TextEncoder()

function toHex(bytes: ArrayBuffer | Uint8Array): string {
    const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
    let out = ''
    for (const b of arr) out += b.toString(16).padStart(2, '0')
    return '0x' + out
}

async function sha256(input: string | Uint8Array): Promise<string> {
    const data = typeof input === 'string' ? enc.encode(input) : input
    const digest = await crypto.subtle.digest('SHA-256', data as BufferSource)
    return toHex(digest)
}

function randomHex(byteLen: number): string {
    const buf = new Uint8Array(byteLen)
    crypto.getRandomValues(buf)
    return toHex(buf)
}

function canonicalize(value: unknown): string {
    if (value === null || typeof value !== 'object') return JSON.stringify(value)
    if (Array.isArray(value)) {
        return '[' + value.map(canonicalize).join(',') + ']'
    }
    const obj = value as Record<string, unknown>
    const keys = Object.keys(obj).sort()
    return (
        '{' +
        keys.map((k) => JSON.stringify(k) + ':' + canonicalize(obj[k])).join(',') +
        '}'
    )
}

async function hashChain(items: string[]): Promise<string> {
    let acc = await sha256('veil-chain-init')
    for (const item of items) {
        acc = await sha256(acc + ':' + item)
    }
    return acc
}

export function computeWitness(
    result: EligibilityResult,
): EligibilityWitness {
    let patientScore = 0
    let trialRequirement = 0
    for (const c of result.criteriaAnalysis as Array<{
        met: boolean | null
        criterion: string
        type?: 'inclusion' | 'exclusion'
        isOverridden?: boolean
    }>) {
        trialRequirement += 2
        if (c.isOverridden) {
            patientScore += 2
        } else if (c.type === 'exclusion') {
            if (c.met === false) patientScore += 2
            else if (c.met === null) patientScore += 1
            else patientScore += 0
        } else {
            if (c.met === true) patientScore += 2
            else if (c.met === null) patientScore += 1
            else patientScore += 0
        }
    }
    if (trialRequirement === 0) trialRequirement = 1
    return { patientScore, trialRequirement }
}

export async function buildEligibilityCommitment(args: {
    trialId: string
    eligible: boolean
    patient: PatientFields
    walletAddress: string
    result: EligibilityResult
    witness: EligibilityWitness
}): Promise<EligibilityCommitment> {
    const { trialId, eligible, patient, walletAddress, result, witness } = args

    const salt = randomHex(32)
    const nonce = randomHex(16)

    const trialIdHash = await sha256(trialId)
    const patientCommitment = await sha256(canonicalize(patient) + ':' + salt)

    const leaves = await Promise.all(
        result.criteriaAnalysis.map(async (c, i) => {
            const isExclusion = (c as any).type === 'exclusion'
            const verdict =
                (c as { isOverridden?: boolean }).isOverridden
                    ? 'override'
                    : isExclusion
                      ? c.met === false
                        ? 'pass'
                        : c.met === true
                          ? 'fail'
                          : 'unknown'
                      : c.met === true
                        ? 'pass'
                        : c.met === false
                          ? 'fail'
                          : 'unknown'
            return sha256(`${i}:${verdict}:${c.criterion}`)
        }),
    )
    const criteriaMerkleRoot = await hashChain(leaves)
    const nullifier = await sha256(walletAddress + ':' + trialId)
    const eligibleBit: 0 | 1 = eligible ? 1 : 0

    const thresholdSatisfied =
        witness.patientScore >= witness.trialRequirement ? '0x01' : '0x00'
    const publicInputs = [
        trialIdHash,
        '0x' + eligibleBit.toString(16).padStart(64, '0'),
        thresholdSatisfied,
    ]

    const signature = await sha256(
        [
            trialIdHash,
            eligibleBit,
            patientCommitment,
            criteriaMerkleRoot,
            nullifier,
            nonce,
            salt,
            ...publicInputs,
        ].join('|'),
    )

    return {
        protocol: 'veil-commitment-v1',
        curve: 'web-crypto-sha-256',
        trialIdHash,
        eligibleBit,
        patientCommitment,
        criteriaMerkleRoot,
        nullifier,
        nonce,
        salt,
        publicInputs,
        signature,
        timestamp: new Date().toISOString(),
    }
}

export async function verifyEligibilityCommitment(
    c: EligibilityCommitment,
): Promise<boolean> {
    const expectedSig = await sha256(
        [
            c.trialIdHash,
            c.eligibleBit,
            c.patientCommitment,
            c.criteriaMerkleRoot,
            c.nullifier,
            c.nonce,
            c.salt,
            ...c.publicInputs,
        ].join('|'),
    )
    return expectedSig === c.signature
}
