import { useState } from 'react'
import { useFlow } from './useFlow'
import { analyzeEligibility } from '../services/geminiClient'

export function useEligibility() {
  const { state, dispatch } = useFlow()
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run() {
    if (!state.patient || !state.selectedTrial) return
    setRunning(true)
    setError(null)
    try {
      const result = await analyzeEligibility(state.patient, state.selectedTrial)
      dispatch({ type: 'SET_ELIGIBILITY', result })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed')
    } finally {
      setRunning(false)
    }
  }

  return {
    result: state.eligibility,
    running,
    error,
    run,
  }
}
