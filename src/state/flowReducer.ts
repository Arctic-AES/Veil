import type {
  PatientFields,
  TrialMatch,
  EligibilityResult,
  ZKProofPayload,
} from '../shared/types'

export type Step = 1 | 2 | 3 | 4

export type QuizAnswers = {
  condition?: string
  region?: string
  priority?: string
}

export type PatientSource = 'demo' | 'import' | null

export type FlowState = {
  step: Step
  quiz: QuizAnswers
  walletAddress: string | null
  walletKind: 'lace' | 'demo' | null
  patient: PatientFields | null
  patientSource: PatientSource
  /** SHA-256 of uploaded file bytes (import path only). */
  documentHashes: string[]
  trials: TrialMatch[]
  selectedTrial: TrialMatch | null
  eligibility: EligibilityResult | null
  proof: ZKProofPayload | null
}

export const initialFlowState: FlowState = {
  step: 1,
  quiz: {},
  walletAddress: null,
  walletKind: null,
  patient: null,
  patientSource: null,
  documentHashes: [],
  trials: [],
  selectedTrial: null,
  eligibility: null,
  proof: null,
}

export type FlowAction =
  | { type: 'SET_STEP'; step: Step }
  | { type: 'ANSWER_QUIZ'; key: keyof QuizAnswers; value: string }
  | { type: 'SET_WALLET'; address: string; kind: 'lace' | 'demo' }
  | { type: 'SET_PATIENT'; patient: PatientFields; source: 'demo' | 'import'; documentHashes?: string[] }
  | { type: 'SET_TRIALS'; trials: TrialMatch[] }
  | { type: 'SELECT_TRIAL'; trial: TrialMatch }
  | { type: 'SET_ELIGIBILITY'; result: EligibilityResult }
  | { type: 'SET_PROOF'; proof: ZKProofPayload }
  | { type: 'RESET' }

export function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step }
    case 'ANSWER_QUIZ':
      return { ...state, quiz: { ...state.quiz, [action.key]: action.value } }
    case 'SET_WALLET':
      return { ...state, walletAddress: action.address, walletKind: action.kind }
    case 'SET_PATIENT':
      return {
        ...state,
        patient: action.patient,
        patientSource: action.source,
        documentHashes: action.documentHashes ?? [],
        eligibility: null,
        proof: null,
      }
    case 'SET_TRIALS':
      return { ...state, trials: action.trials }
    case 'SELECT_TRIAL':
      return { ...state, selectedTrial: action.trial, eligibility: null, proof: null }
    case 'SET_ELIGIBILITY':
      return { ...state, eligibility: action.result }
    case 'SET_PROOF':
      return { ...state, proof: action.proof }
    case 'RESET':
      return initialFlowState
    default:
      return state
  }
}
