import { useState } from 'react'
import { useFlow } from './useFlow'
import { generateProof, type ProofProgress } from '../services/zkProver'

export function useZkProof() {
  const { state, dispatch } = useFlow()
  const [progress, setProgress] = useState<ProofProgress[]>([])
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generate() {
    if (!state.eligibility) {
      setError('No eligibility result to prove.')
      return
    }
    setRunning(true)
    setProgress([])
    setError(null)
    try {
      const proof = await generateProof(state.eligibility, (p) =>
        setProgress((prev) => [...prev, p]),
      )
      dispatch({ type: 'SET_PROOF', proof })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Proof failed')
    } finally {
      setRunning(false)
    }
  }

  function reset() {
    setProgress([])
    setError(null)
  }

  return {
    proof: state.proof,
    progress,
    running,
    error,
    generate,
    reset,
  }
}
