import { useEffect, useState } from 'react'
import { useFlow } from './useFlow'
import { searchTrials } from '../services/clinicalTrialsApi'

export function useTrialMatches() {
  const { state, dispatch } = useFlow()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (state.trials.length > 0) return
    if (!state.quiz.condition) return
    let cancelled = false
    setLoading(true)
    searchTrials({
      condition: state.quiz.condition,
      region: state.quiz.region,
    })
      .then((trials) => {
        if (cancelled) return
        dispatch({ type: 'SET_TRIALS', trials })
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Search failed')
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [state.quiz.condition, state.quiz.region, state.trials.length, dispatch])

  return { trials: state.trials, loading, error }
}
