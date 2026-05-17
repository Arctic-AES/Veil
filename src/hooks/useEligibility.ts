import { useState } from 'react'
import { useFlow } from './useFlow'
import { analyzeEligibility } from '../services/geminiClient'
import { useRateLimit } from './useRateLimit'

export function useEligibility() {
  const { state, dispatch } = useFlow()
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { cooldown, handleRateLimit } = useRateLimit()

  async function run() {
    if (!state.patient || !state.selectedTrial || cooldown > 0) return
    setRunning(true)
    setError(null)
    try {
      const result = await analyzeEligibility(state.patient, state.selectedTrial)
      dispatch({ type: 'SET_ELIGIBILITY', result })
    } catch (e) {
      if (handleRateLimit(e)) {
        setError(null)
      } else {
        setError(e instanceof Error ? e.message : 'Analysis failed')
      }
    } finally {
      setRunning(false)
    }
  }

  return {
    result: state.eligibility,
    running,
    error,
    cooldown,
    run,
  }
}
